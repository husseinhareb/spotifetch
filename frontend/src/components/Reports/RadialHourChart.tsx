import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import styled, { useTheme } from 'styled-components';

interface RadialHourChartProps {
  data: number[];
  width?: number;
  height?: number;
}

const ChartContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Tooltip = styled.div<{ visible: boolean; x: number; y: number }>`
  position: absolute;
  left: ${props => props.x}px;
  top: ${props => props.y}px;
  background: ${({ theme }) => theme.colors.backgroundSolid};
  color: ${({ theme }) => theme.colors.text};
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  pointer-events: none;
  opacity: ${props => props.visible ? 1 : 0};
  transition: opacity 0.2s ease;
  z-index: 10;
  border: 1px solid ${({ theme }) => theme.colors.buttonBackground};
  
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 4px solid transparent;
    border-top-color: ${({ theme }) => theme.colors.backgroundSolid};
  }
`;

const RadialHourChart: React.FC<RadialHourChartProps> = ({
  data,
  width = 300,
  height = 300,
}) => {
  const theme: any = useTheme();
  const ref = useRef<SVGSVGElement | null>(null);
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    content: string;
  }>({
    visible: false,
    x: 0,
    y: 0,
    content: '',
  });

  useEffect(() => {
    if (!ref.current) return;

    // normalize incoming data to 24 entries (pad with zeros if needed)
    const hours = Array.isArray(data) ? data.slice(0, 24) : [];
    while (hours.length < 24) hours.push(0);

    if (hours.length === 0) return;

    const svg = d3.select<SVGSVGElement, unknown>(ref.current);
    svg.selectAll('*').remove();
  // allow labels outside arcs to be visible instead of clipped
  svg.attr('overflow', 'visible');

  const w = width;
  const h = height;
  const minSide = Math.min(w, h);
  const margin = Math.max(24, Math.floor(minSide * 0.08));
    const outerRadius = Math.floor(minSide / 2) - margin;
    const innerRadius = Math.max(outerRadius * 0.42, Math.floor(minSide * 0.12));

    const g = svg
      .append('g')
      .attr('transform', `translate(${w / 2}, ${h / 2})`);

    // Enhanced scales
    const angle = d3
      .scaleBand<number>()
      .domain(d3.range(24))
      .range([0, 2 * Math.PI])
      .align(0)
      .padding(0.02);

    const valueMax = d3.max(hours) || 1;
    const radius = d3.scaleLinear().domain([0, valueMax]).range([innerRadius, outerRadius]);

    // Enhanced color scale using theme accent
    const accent = theme?.colors?.accent || '#1DB954';
    // derive a lighter accent for interpolation if provided
    const accent2 = theme?.colors?.accentLight || accent;
    const color = d3
      .scaleSequential()
      .domain([0, valueMax])
      .interpolator(d3.interpolateRgb(accent, accent2));

    // Arc generator
    const arcGen = d3
      .arc<number>()
      .startAngle((_, i) => angle(i)!)
      .endAngle((_, i) => angle(i)! + (angle.bandwidth() ?? 0))
      .innerRadius(innerRadius)
      .outerRadius(d => radius(d))
      .cornerRadius(2);

    // Add background rings for better visual context
    const rings = [0.25, 0.5, 0.75, 1];
    rings.forEach(ratio => {
      g.append('circle')
        .attr('r', innerRadius + (outerRadius - innerRadius) * ratio)
        .attr('fill', 'none')
        .attr('stroke', theme?.colors?.buttonBackground || '#333')
        .attr('stroke-width', 0.5)
        .attr('stroke-dasharray', '2,2')
        .attr('opacity', 0.4);
    });

    // Draw the 24 bars with enhanced interactivity
    const barsSelection = g.selectAll('path')
      .data(hours as number[])
      .enter()
      .append('path')
    .attr('d', (d, i) => (arcGen as any)(d, i))
    .attr('fill', d => color(d))
    .attr('stroke', theme?.colors?.buttonBackground || '#000')
    .attr('stroke-width', 0.5)
      .style('cursor', 'pointer')
      .style('opacity', 0.8)
      .on('mouseover', function(event, d) {
        // compute index of this element reliably
        const nodes = g.selectAll('path').nodes();
        const hour = nodes.indexOf(this as any);
        const hourFormatted = hour === 0 ? '12 AM' :
                             hour < 12 ? `${hour} AM` :
                             hour === 12 ? '12 PM' :
                             `${hour - 12} PM`;

        d3.select(this)
          .transition()
          .duration(150)
          .style('opacity', 1)
          .attr('stroke-width', 1)
          .attr('stroke', theme?.colors?.accent || '#1DB954');

        const rect = ref.current!.getBoundingClientRect();
        setTooltip({
          visible: true,
          x: event.clientX - rect.left,
          y: event.clientY - rect.top - 30,
          content: `${hourFormatted}: ${d.toLocaleString()} plays`,
        });
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(150)
          .style('opacity', 0.8)
          .attr('stroke-width', 0.5)
          .attr('stroke', theme?.colors?.backgroundSolid ? '#000' : '#000');

        setTooltip(prev => ({ ...prev, visible: false }));
      });

    // Animate bars on load
    barsSelection
      .attr('opacity', 0)
      .transition()
      .duration(1000)
      .delay((_, i) => i * 30)
      .attr('opacity', 0.8);

    // Enhanced hour labels with better positioning
    const allHours = d3.range(24);
    const majorTicks = [0, 6, 12, 18];
    const minorTicks = allHours.filter(h => !majorTicks.includes(h));

    // Major hour labels (anchor based on angle so cardinal points align)
    majorTicks.forEach(h => {
      const start = angle(h)!;
      const ang = start + (angle.bandwidth() ?? 0) / 2 - Math.PI / 2;
  // keep labels just outside the outer radius but within the svg viewbox
  const labelRadius = outerRadius + Math.max(8, Math.floor(minSide * 0.02));

      const cx = Math.cos(ang);
      const cy = Math.sin(ang);
      let anchor: 'start' | 'middle' | 'end' = 'middle';
      if (cx > 0.3) anchor = 'start';
      else if (cx < -0.3) anchor = 'end';

  g.append('text')
    .attr('x', cx * labelRadius)
    .attr('y', cy * labelRadius)
    .attr('text-anchor', anchor)
    .attr('alignment-baseline', 'middle')
    .style('fill', theme?.colors?.text || '#fff')
  .style('font-size', `${Math.max(10, Math.floor(minSide * 0.025))}px`)
    .style('font-weight', '700')
    .text(h === 0 ? '12AM' : 
      h < 12 ? `${h}AM` : 
      h === 12 ? '12PM' : 
      `${h-12}PM`);
    });

    // Minor tick marks
    minorTicks.forEach(h => {
      const start = angle(h)!;
      const ang = start + (angle.bandwidth() ?? 0) / 2 - Math.PI / 2;
      const tickInner = outerRadius - Math.max(8, Math.floor(minSide * 0.02));
      const tickOuter = outerRadius - Math.max(4, Math.floor(minSide * 0.01));

      g.append('line')
        .attr('x1', Math.cos(ang) * tickInner)
        .attr('y1', Math.sin(ang) * tickInner)
        .attr('x2', Math.cos(ang) * tickOuter)
        .attr('y2', Math.sin(ang) * tickOuter)
    .attr('stroke', theme?.colors?.textSecondary || '#666')
        .attr('stroke-width', 1);
    });

    // Add center text showing peak hour (or no plays)
    const totalPlays = hours.reduce((s, v) => s + (v || 0), 0);
    const peakIndex = hours.indexOf(Math.max(...hours));
    const peakHour = peakIndex === 0 ? '12 AM' :
                     peakIndex < 12 ? `${peakIndex} AM` :
                     peakIndex === 12 ? '12 PM' :
                     `${peakIndex - 12} PM`;

    // add center badge background to improve contrast
    const centerGroup = g.append('g').attr('text-anchor', 'middle');
    centerGroup.append('circle')
      .attr('r', innerRadius - Math.max(8, Math.floor(minSide * 0.03)))
      .attr('fill', theme?.colors?.backgroundSolid || 'rgba(10,10,10,0.8)')
      .attr('stroke', theme?.colors?.buttonBackground || '#222')
      .attr('stroke-width', 1);

    centerGroup.append('text')
      .attr('y', -8)
      .style('fill', theme?.colors?.text || '#ccc')
      .style('font-size', `${Math.max(11, Math.floor(minSide * 0.03))}px`)
      .style('font-weight', '600')
      .text(totalPlays > 0 ? 'Peak Hour' : 'No Activity');
      
    centerGroup.append('text')
      .attr('y', 12)
      .style('fill', totalPlays > 0 ? (theme?.colors?.accent || '#1DB954') : theme?.colors?.textSecondary || '#777')
      .style('font-size', `${Math.max(14, Math.floor(minSide * 0.04))}px`)
      .style('font-weight', '800')
      .text(totalPlays > 0 ? peakHour : '--');

    centerGroup.append('text')
      .attr('y', 30)
      .style('fill', theme?.colors?.textSecondary || '#999')
      .style('font-size', `${Math.max(10, Math.floor(minSide * 0.025))}px`)
      .text(totalPlays > 0 ? `${Math.max(...hours)} plays` : '');

  }, [data, width, height]);

  return (
    <ChartContainer>
      <svg ref={ref} width={width} height={height} />
      <Tooltip
        visible={tooltip.visible}
        x={Math.max(8, Math.min(width - 160, tooltip.x))}
        y={Math.max(8, Math.min(height - 80, tooltip.y))}
      >
        {tooltip.content}
      </Tooltip>
    </ChartContainer>
  );
};

export default RadialHourChart;
