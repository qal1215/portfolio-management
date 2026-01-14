import { formatVnd, formatVndCompact } from './portfolio.utils';

type PortfolioOverviewCardsProps = {
  totalAssetValue: number;
  totalDeposited: number;
  totalProfit: number;
  roi: number;
};

const StatCard = ({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
    <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
    <p className="mt-1 text-xs text-slate-500">{helper}</p>
  </div>
);

export default function PortfolioOverviewCards({
  totalAssetValue,
  totalDeposited,
  totalProfit,
  roi,
}: PortfolioOverviewCardsProps) {
  const roiLabel = Number.isFinite(roi) ? `${roi.toFixed(2)}%` : '--';

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Total Asset Value"
        value={formatVndCompact(totalAssetValue)}
        helper={`Latest NAV: ${formatVnd(totalAssetValue)}`}
      />
      <StatCard
        label="Capital Deposited"
        value={formatVndCompact(totalDeposited)}
        helper={`Base capital: ${formatVnd(totalDeposited)}`}
      />
      <StatCard
        label="Total Profit"
        value={formatVndCompact(totalProfit)}
        helper={`Net gains to date`}
      />
      <StatCard label="ROI" value={roiLabel} helper="Profit / Deposited" />
    </div>
  );
}
