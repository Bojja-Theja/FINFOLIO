/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { select } from 'd3-selection';
import { sankey as d3Sankey, linkHorizontal } from 'd3-sankey';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';

interface SankeyData {
  nodes: { name: string; category?: string }[];
  links: { source: number; target: number; value: number; category?: string }[];
}

interface CashFlowSankeyProps {
  data: SankeyData;
  loading?: boolean;
  title?: string;
}

const CashFlowSankey: React.FC<CashFlowSankeyProps> = ({ data, loading = false, title = 'Cash Flow Analysis' }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const safeData = useMemo(
    () => ({
      nodes: Array.isArray(data?.nodes) ? data.nodes : [],
      links: Array.isArray(data?.links) ? data.links : [],
    }),
    [data]
  );

  useEffect(() => {
    if (!safeData.nodes.length || !safeData.links.length) {
      setError('Missing required cash flow data.');
      return;
    }
    const invalidNode = safeData.nodes.some((n) => !n || typeof n.name !== 'string');
    const invalidLink = safeData.links.some(
      (l) =>
        l == null ||
        typeof (l as any).source !== 'number' ||
        typeof (l as any).target !== 'number' ||
        typeof (l as any).value !== 'number'
    );
    if (invalidNode || invalidLink) {
      setError('Cash flow data is malformed.');
      return;
    }
    setError(null);
  }, [safeData]);

  const getColorByCategory = (category?: string): string => {
    const colorMap: Record<string, string> = {
      income: '#10b981',
      expense: '#ef4444',
      savings: '#3b82f6',
      investment: '#f59e0b',
      default: '#6b7280',
    };
    return colorMap[category?.toLowerCase() ?? 'default'] ?? '#6b7280';
  };

  const generateLinkPath = (source: any, target: any) => {
    if (!source || !target) return '';
    return linkHorizontal()({
      source: [
        source.x1 ?? 0,
        (source.y0 ?? 0) + ((source.y1 ?? source.y0 ?? 0) - (source.y0 ?? 0)) / 2,
      ],
      target: [
        target.x0 ?? 0,
        (target.y0 ?? 0) + ((target.y1 ?? target.y0 ?? 0) - (target.y0 ?? 0)) / 2,
      ],
    });
  };

  useEffect(() => {
    if (error || !svgRef.current || !safeData.nodes.length || !safeData.links.length || !isClient) return;
    try {
      const svg = select(svgRef.current);
      const width = svgRef.current.clientWidth || 800;
      const height = svgRef.current.clientHeight || 400;

      svg.attr('viewBox', `0 0 ${width} ${height}`);
      svg.selectAll('*').remove();

      const sankeyGen = d3Sankey()
        .nodeWidth(15)
        .nodePadding(30)
        .extent([
          [10, 10],
          [width - 10, height - 10],
        ]);

      const { nodes, links } = sankeyGen({
        nodes: safeData.nodes.map((n) => ({ ...n })),
        links: safeData.links.map((l) => ({ ...l })),
      });

      // Add gradient definitions
      const defs = svg.append('defs');
      
      // Create gradient for links
      const gradient = defs.append('linearGradient')
        .attr('id', 'sankeyGradient')
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr('y2', '100%');
      
      gradient.append('stop').attr('offset', '0%').attr('stop-color', '#3b82f6').attr('stop-opacity', 0.8);
      gradient.append('stop').attr('offset', '100%').attr('stop-color', '#10b981').attr('stop-opacity', 0.6);

      // Nodes with better styling
      svg
        .selectAll('.node')
        .data(nodes)
        .join('rect')
        .attr('class', 'node')
        .attr('x', (d: any) => d.x0 ?? 0)
        .attr('y', (d: any) => d.y0 ?? 0)
        .attr('width', (d: any) => Math.max(0, (d.x1 ?? d.x0 ?? 0) - (d.x0 ?? 0)))
        .attr('height', (d: any) => Math.max(0, (d.y1 ?? d.y0 ?? 0) - (d.y0 ?? 0)))
        .attr('fill', (d: any) => getColorByCategory(d.category))
        .attr('opacity', 0.9)
        .attr('rx', 5)
        .attr('ry', 5);

      // Links with gradient and better visuals
      svg
        .selectAll('.link')
        .data(links)
        .join('path')
        .attr('class', 'link')
        .attr('d', (d: any) => generateLinkPath(d.source, d.target))
        .attr('stroke', (d: any) => getColorByCategory(d.category ?? d.source?.category))
        .attr('stroke-width', (d: any) => Math.max(2, Math.sqrt(d.value ?? 0) * 2))
        .attr('opacity', 0.7)
        .attr('fill', 'none')
        .attr('stroke-linecap', 'round');

      // Add hover effects
      svg.selectAll('.link')
        .on('mouseover', function(this: SVGPathElement) {
          select(this).attr('opacity', 0.9).attr('stroke-width', (d: any) => Math.max(3, Math.sqrt(d.value ?? 0) * 2.5));
        })
        .on('mouseout', function(this: SVGPathElement) {
          select(this).attr('opacity', 0.7).attr('stroke-width', (d: any) => Math.max(2, Math.sqrt(d.value ?? 0) * 2));
        });

      // Labels with better positioning and styling
      svg
        .selectAll('.label')
        .data(nodes)
        .join('text')
        .attr('class', 'label')
        .attr('x', (d: any) => (d.x0 ?? 0) + ((d.x1 ?? d.x0 ?? 0) - (d.x0 ?? 0)) / 2)
        .attr('y', (d: any) => (d.y0 ?? 0) + ((d.y1 ?? d.y0 ?? 0) - (d.y0 ?? 0)) / 2)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', 14)
        .attr('font-weight', 'bold')
        .attr('fill', 'white')
        .attr('stroke', 'white')
        .attr('stroke-width', 0.5)
        .attr('paint-order', 'stroke')
        .text((d: any) => d.name);

      // Add value labels on links
      svg
        .selectAll('.link-label')
        .data(links)
        .join('text')
        .attr('class', 'link-label')
        .attr('x', (d: any) => {
          const sourceX = d.source?.x1 !== undefined ? d.source.x1 : 0;
          const targetX = d.target?.x0 !== undefined ? d.target.x0 : 0;
          return (sourceX + targetX) / 2;
        })
        .attr('y', (d: any) => {
          const sourceY0 = d.source?.y0 !== undefined ? d.source.y0 : 0;
          const sourceY1 = d.source?.y1 !== undefined ? d.source.y1 : 0;
          const targetY0 = d.target?.y0 !== undefined ? d.target.y0 : 0;
          const targetY1 = d.target?.y1 !== undefined ? d.target.y1 : 0;
          return ((sourceY0 + sourceY1) / 2 + (targetY0 + targetY1) / 2) / 2;
        })
        .attr('text-anchor', 'middle')
        .attr('font-size', 12)
        .attr('fill', '#6b7280')
        .text((d: any) => `₹${Math.round(d.value !== undefined ? d.value : 0).toLocaleString()}`);

    } catch (err) {
      console.error('CashFlowSankey render error:', err);
      setError('Unable to render cash flow chart.');
    }
  }, [safeData, error, isClient]);

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%" p={4}>
        <CircularProgress color="primary" size={40} />
        <Typography variant="body2" color="text.secondary" mt={2}>
          Loading cash flow analysis...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        <Typography variant="body2">{error}</Typography>
        <Typography variant="caption" color="text.secondary">
          Please check your data and try again.
        </Typography>
      </Alert>
    );
  }

  if (!safeData.nodes.length || !safeData.links.length) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        <Typography variant="body2">No cash flow data available</Typography>
        <Typography variant="caption" color="text.secondary">
          Complete your financial profile to see your cash flow analysis.
        </Typography>
      </Alert>
    );
  }

  return (
    <Box height="100%" width="100%">
      {title && (
        <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ px: 2, pt: 1 }}>
          {title}
        </Typography>
      )}
      <svg ref={svgRef} style={{ width: '100%', height: 'calc(100% - 40px)' }} />
    </Box>
  );
};

export default CashFlowSankey;