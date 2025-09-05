import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import styled from 'styled-components';

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
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  pointer-events: none;
  opacity: ${props => props.visible ? 1 : 0};
  transition: opacity 0.2s ease;
  z-index: 10;
  border: 1px solid #333;
  
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 4px solid transparent;
    border-top-color: rgba(0, 0, 0, 0.9);
  }
`;

const RadialHourChart: React.FC<RadialHourChartProps> = ({
  data,
  width = 300,
  height = 300,
}) => {
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
    if (!data.length || !ref.current) return;

    const svg = d3.select<SVGSVGElement, unknown>(ref.current);
    svg.selectAll('*').remove();

    const margin = 40;
    const innerRadius = Math.min(width, height) / 6;
    const outerRadius = Math.min(width, height) / 2 - margin;

    const g = svg
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    // Enhanced scales
    const angle = d3
      .scaleBand<number>()
      .domain(d3.range(24))
      .range([0, 2 * Math.PI])
      .align(0)
      .padding(0.02);

    const valueMax = d3.max(data) || 1;
    const radius = d3
      .scaleLinear()
      .domain([0, valueMax])
      .range([innerRadius, outerRadius]);

    // Enhanced color scale with Spotify-like gradient
    const color = d3
      .scaleSequential()
      .domain([0, valueMax])
      .interpolator(d3.interpolateRgb('#1DB954', '#1ed760'));

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
        .attr('stroke', '#333')
        .attr('stroke-width', 0.5)
        .attr('stroke-dasharray', '2,2')
        .attr('opacity', 0.3);
    });

    // Draw the 24 bars with enhanced interactivity
    const bars = g.selectAll('path')
      .data(data)
      .enter()
      .append('path')
      .attr('d', arcGen as any)
      .attr('fill', d => color(d))
      .attr('stroke', '#000')
      .attr('stroke-width', 0.5)
      .style('cursor', 'pointer')
      .style('opacity', 0.8)
      .on('mouseover', function(event, d) {
        const hour = data.indexOf(d);
        const hourFormatted = hour === 0 ? '12 AM' :
                             hour < 12 ? `${hour} AM` :
                             hour === 12 ? '12 PM' :
                             `${hour - 12} PM`;
        
        d3.select(this)
          .transition()
          .duration(150)
          .style('opacity', 1)
          .attr('stroke-width', 1)
          .attr('stroke', '#1DB954');

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
          .attr('stroke', '#000');

        setTooltip(prev => ({ ...prev, visible: false }));
      });

    // Animate bars on load
    bars
      .attr('opacity', 0)
      .transition()
      .duration(1000)
      .delay((_, i) => i * 50)
      .attr('opacity', 0.8);

    // Enhanced hour labels with better positioning
    const allHours = d3.range(24);
    const majorTicks = [0, 6, 12, 18];
    const minorTicks = allHours.filter(h => !majorTicks.includes(h));

    // Major hour labels
    majorTicks.forEach(h => {
      const start = angle(h)!;
      const ang = start + (angle.bandwidth() ?? 0) / 2 - Math.PI / 2;
      const labelRadius = innerRadius - 20;

      g.append('text')
        .attr('x', Math.cos(ang) * labelRadius)
        .attr('y', Math.sin(ang) * labelRadius)
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .style('fill', '#fff')
        .style('font-size', '14px')
        .style('font-weight', 'bold')
        .text(h === 0 ? '12AM' : 
              h < 12 ? `${h}AM` : 
              h === 12 ? '12PM' : 
              `${h-12}PM`);
    });

    // Minor tick marks
    minorTicks.forEach(h => {
      const start = angle(h)!;
      const ang = start + (angle.bandwidth() ?? 0) / 2 - Math.PI / 2;
      const tickInner = innerRadius - 8;
      const tickOuter = innerRadius - 4;

      g.append('line')
        .attr('x1', Math.cos(ang) * tickInner)
        .attr('y1', Math.sin(ang) * tickInner)
        .attr('x2', Math.cos(ang) * tickOuter)
        .attr('y2', Math.sin(ang) * tickOuter)
        .attr('stroke', '#666')
        .attr('stroke-width', 1);
    });

    // Add center text showing peak hour
    const peakIndex = data.indexOf(Math.max(...data));
    const peakHour = peakIndex === 0 ? '12 AM' :
                     peakIndex < 12 ? `${peakIndex} AM` :
                     peakIndex === 12 ? '12 PM' :
                     `${peakIndex - 12} PM`;

    const centerGroup = g.append('g').attr('text-anchor', 'middle');
    
    centerGroup.append('text')
      .attr('y', -10)
      .style('fill', '#ccc')
      .style('font-size', '12px')
      .text('Peak Hour');
      
    centerGroup.append('text')
      .attr('y', 8)
      .style('fill', '#1DB954')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text(peakHour);

    centerGroup.append('text')
      .attr('y', 24)
      .style('fill', '#999')
      .style('font-size', '10px')
      .text(`${Math.max(...data)} plays`);

  }, [data, width, height]);

  return (
    <ChartContainer>
      <svg ref={ref} width={width} height={height} />
      <Tooltip
        visible={tooltip.visible}
        x={tooltip.x}
        y={tooltip.y}
      >
        {tooltip.content}
      </Tooltip>
    </ChartContainer>
  );
};

export default RadialHourChart;
