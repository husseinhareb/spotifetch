import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

interface RadialHourChartProps {
  data: number[];
  width?: number;
  height?: number;
}

const RadialHourChart: React.FC<RadialHourChartProps> = ({
  data,
  width = 300,
  height = 300,
}) => {
  // Ref for the SVG element
  const ref = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    // Guard against empty data or missing ref
    if (!data.length || !ref.current) return;

    // Clear and set up the SVG
    const svg = d3.select<SVGSVGElement, unknown>(ref.current);
    svg.selectAll('*').remove();

    const innerRadius = Math.min(width, height) / 5;
    const outerRadius = Math.min(width, height) / 2 - 20;

    const g = svg
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    // Angle scale: one band per hour (0–23)
    const angle = d3
      .scaleBand<number>()
      .domain(d3.range(24))
      .range([0, 2 * Math.PI])
      .align(0);

    // Linear scale for bar length
    const valueMax = d3.max(data)!;
    const radius = d3
      .scaleLinear()
      .domain([0, valueMax])
      .range([innerRadius, outerRadius]);

    // Color scale
    const color = d3
      .scaleSequential(d3.interpolateBlues)
      .domain([0, valueMax]);

    // Arc generator with non-null assertions
    const arcGen = d3
      .arc<number>()
      .startAngle((_, i) => angle(i)!)
      .endAngle((_, i) => angle(i)! + (angle.bandwidth() ?? 0))
      .innerRadius(innerRadius)
      .outerRadius(d => radius(d));

    // Draw the 24 bars
    g.selectAll('path')
      .data(data)
      .enter()
      .append('path')
      .attr('d', arcGen)
      .attr('fill', d => color(d));

    // Add the hour labels at 00, 06, 12, 18
    const ticks = [0, 6, 12, 18];
    ticks.forEach(h => {
      const start = angle(h)!;
      const ang = start + (angle.bandwidth() ?? 0) / 2 - Math.PI / 2;
      const labelRadius = innerRadius - 10;

      g.append('text')
        .attr('x', Math.cos(ang) * labelRadius)
        .attr('y', Math.sin(ang) * labelRadius)
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .style('fill', '#fff')
        .style('font-size', '12px')
        .text(h.toString().padStart(2, '0'));
    });
  }, [data, width, height]);

  return <svg ref={ref} width={width} height={height} />;
};

export default RadialHourChart;
