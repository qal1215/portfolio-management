import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from 'recharts';
import type { PortfolioTimelinePoint } from './portfolio.types';
import { formatVnd, formatVndCompact } from './portfolio.utils';

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number, string>) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const point = payload[0].payload as PortfolioTimelinePoint;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-md">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
        {formatDate(String(label ?? ''))}
      </p>
      <div className="mt-2 space-y-1 text-sm text-slate-700">
        <div className="flex items-center justify-between gap-6">
          <span>Total value</span>
          <span className="font-semibold">{formatVnd(point.totalValue)}</span>
        </div>
        <div className="flex items-center justify-between gap-6">
          <span>Asset value</span>
          <span>{formatVnd(point.assetValue)}</span>
        </div>
        <div className="flex items-center justify-between gap-6">
          <span>Profit</span>
          <span>{formatVnd(point.profit)}</span>
        </div>
        <div className="flex items-center justify-between gap-6">
          <span>Reinvested</span>
          <span>{formatVnd(point.reinvested)}</span>
        </div>
      </div>
    </div>
  );
};

export default function WealthTimelineChart({ data }: { data: PortfolioTimelinePoint[] }) {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 24, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
          <XAxis dataKey="date" tickFormatter={formatDate} stroke="#94a3b8" />
          <YAxis
            tickFormatter={(value) => formatVndCompact(Number(value))}
            stroke="#94a3b8"
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="totalValue"
            stroke="#0f172a"
            strokeWidth={2}
            dot={{ r: 3, stroke: '#0f172a', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
