import { useMemo } from 'react';
import { scaleOrdinal } from 'd3';
import {
  sankey,
  sankeyJustify,
  sankeyLinkHorizontal,
  type SankeyGraph,
} from 'd3-sankey';

export type CapitalFlowNode = {
  id: string;
  label: string;
};

export type CapitalFlowLink = {
  source: string;
  target: string;
  value: number;
};

export type CapitalFlowData = {
  nodes: CapitalFlowNode[];
  links: CapitalFlowLink[];
};

const chartWidth = 960;
const chartHeight = 420;
const numberFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
});

const palette = ['#0f766e', '#2563eb', '#f59e0b', '#0ea5e9', '#ef4444'];

export default function SankeyFlowChart({ data }: { data: CapitalFlowData }) {
  const sankeyGraph = useMemo(() => {
    const generator = sankey<CapitalFlowNode, CapitalFlowLink>()
      .nodeId((node) => node.id)
      .nodeAlign(sankeyJustify)
      .nodeWidth(18)
      .nodePadding(26)
      .extent([
        [0, 8],
        [chartWidth, chartHeight - 8],
      ]);

    // D3 mutates nodes/links, so clone to keep props immutable.
    return generator({
      nodes: data.nodes.map((node) => ({ ...node })),
      links: data.links.map((link) => ({ ...link })),
    } as SankeyGraph<CapitalFlowNode, CapitalFlowLink>);
  }, [data]);

  const linkPath = sankeyLinkHorizontal();
  const nodeIds = sankeyGraph.nodes.map((node) => node.id);
  const colorScale = useMemo(
    () => scaleOrdinal<string, string>().domain(nodeIds).range(palette),
    [nodeIds.join('|')]
  );

  return (
    <div className="h-[420px] w-full">
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        preserveAspectRatio="xMidYMid meet"
        className="h-full w-full"
      >
        <g fill="none" strokeOpacity={0.35}>
          {sankeyGraph.links.map((link, index) => {
            const sourceId =
              typeof link.source === 'object'
                ? link.source.id ?? ''
                : String(link.source ?? '');
            const stroke = colorScale(sourceId) ?? '#0f172a';

            return (
              <path
                key={`${sourceId}-${index}`}
                d={linkPath(link) ?? ''}
                stroke={stroke}
                strokeWidth={Math.max(1, link.width ?? 1)}
              >
                <title>{`Flow: ${numberFormatter.format(link.value)} VND`}</title>
              </path>
            );
          })}
        </g>

        <g>
          {sankeyGraph.nodes.map((node) => {
            const x0 = node.x0 ?? 0;
            const x1 = node.x1 ?? 0;
            const y0 = node.y0 ?? 0;
            const y1 = node.y1 ?? 0;
            const isLeft = x0 < chartWidth / 2;
            const color = colorScale(node.id) ?? '#1e293b';

            return (
              <g key={node.id}>
                <rect
                  x={x0}
                  y={y0}
                  width={x1 - x0}
                  height={y1 - y0}
                  rx={8}
                  fill={color}
                  opacity={0.9}
                >
                  <title>{`${node.label} - ${numberFormatter.format(node.value ?? 0)} VND`}</title>
                </rect>
                <text
                  x={isLeft ? x1 + 12 : x0 - 12}
                  y={(y0 + y1) / 2}
                  textAnchor={isLeft ? 'start' : 'end'}
                  dominantBaseline="middle"
                  className="fill-slate-700 text-[13px] font-medium"
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
