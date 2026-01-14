import { formatVndCompact, formatVnd } from './portfolio.utils';

export type AssetSummary = {
  symbol: string;
  cost: number;
  currentValue: number;
  delta: number;
  deltaPercent: number;
};

export default function AssetSummaryPanel({ assets }: { assets: AssetSummary[] }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/85 p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Assets Snapshot</h3>
        <p className="text-sm text-slate-500">Current value vs cost basis by symbol.</p>
      </div>
      {assets.length === 0 ? (
        <p className="text-sm text-slate-400">No asset valuation data yet.</p>
      ) : (
        <div className="space-y-4">
          {assets.map((asset) => {
            const isPositive = asset.delta >= 0;
            const deltaLabel = `${isPositive ? '+' : ''}${asset.deltaPercent.toFixed(1)}%`;

            return (
              <div
                key={asset.symbol}
                className="rounded-2xl border border-slate-100 bg-white p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{asset.symbol}</p>
                    <p className="text-xs text-slate-400">Cost: {formatVnd(asset.cost)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">
                      {formatVndCompact(asset.currentValue)}
                    </p>
                    <p
                      className={
                        isPositive ? 'text-xs text-emerald-600' : 'text-xs text-rose-500'
                      }
                    >
                      {deltaLabel}
                    </p>
                  </div>
                </div>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={isPositive ? 'h-full bg-emerald-400' : 'h-full bg-rose-400'}
                    style={{
                      width: `${Math.min(Math.abs(asset.deltaPercent), 100)}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
