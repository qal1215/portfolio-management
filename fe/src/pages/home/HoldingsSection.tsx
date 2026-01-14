import PriceSparkline from '../../components/atomic/molecules/PriceSparkline';
import type { AssetRecord } from './add-new-transaction';
import { convertCurrency, currencyOptions, numberFormatter } from './home.utils';

type HoldingsSectionProps = {
  assets: AssetRecord[];
  baseCurrency: string;
  onBaseCurrencyChange: (next: string) => void;
  totalCostBase: number;
  totalMarketValueBase: number;
  totalUnrealizedBase: number;
  isPriceSyncing: boolean;
  lastPriceSync: string | null;
  hasMissingRates: boolean;
  cryptoSubscriptionStatus: string;
  cryptoSubscriptionInfo: string;
  priceSyncError: string;
  priceHistory: Record<string, number[]>;
};

export default function HoldingsSection({
  assets,
  baseCurrency,
  onBaseCurrencyChange,
  totalCostBase,
  totalMarketValueBase,
  totalUnrealizedBase,
  isPriceSyncing,
  lastPriceSync,
  hasMissingRates,
  cryptoSubscriptionStatus,
  cryptoSubscriptionInfo,
  priceSyncError,
  priceHistory,
}: HoldingsSectionProps) {
  const lastSyncLabel = isPriceSyncing
    ? 'Syncing prices...'
    : lastPriceSync
      ? `Last sync: ${new Date(lastPriceSync).toLocaleTimeString()}`
      : 'Last sync: --';

  return (
    <section className="space-y-3 rounded border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Holdings</h2>
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
          <span>
            Total cost: {numberFormatter.format(totalCostBase)} {baseCurrency}
          </span>
          <span>
            Market value: {numberFormatter.format(totalMarketValueBase)} {baseCurrency}
          </span>
          <span className={totalUnrealizedBase >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
            Unrealized P/L: {numberFormatter.format(totalUnrealizedBase)} {baseCurrency}
          </span>
          <span>{lastSyncLabel}</span>
          <label className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-400">
            Base
            <select
              value={baseCurrency}
              onChange={(event) => onBaseCurrencyChange(event.target.value)}
              className="rounded border border-slate-300 px-2 py-1 text-xs uppercase text-slate-600"
            >
              {currencyOptions.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
      {hasMissingRates ? (
        <p className="text-xs text-amber-600">Missing FX rate for some currencies.</p>
      ) : null}
      {cryptoSubscriptionInfo ? (
        <p className="text-xs text-slate-500">
          Crypto subscription:{' '}
          <span
            className={
              cryptoSubscriptionStatus === 'subscribed'
                ? 'text-emerald-600'
                : cryptoSubscriptionStatus === 'failed'
                  ? 'text-rose-600'
                  : 'text-slate-500'
            }
          >
            {cryptoSubscriptionStatus}
          </span>{' '}
          ({cryptoSubscriptionInfo})
        </p>
      ) : null}
      {priceSyncError ? <p className="text-xs text-rose-600">{priceSyncError}</p> : null}

      {assets.length === 0 ? (
        <p className="text-sm text-slate-500">No assets yet. Add your first holding above.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="py-2 pr-4">Symbol</th>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4">Avg price</th>
                <th className="py-2 pr-4">Quantity</th>
                <th className="py-2 pr-4">Currency</th>
                <th className="py-2 pr-4">Cost</th>
                <th className="py-2 pr-4">Market</th>
                <th className="py-2 pr-4">Unrealized</th>
                <th className="py-2 pr-4">Trend</th>
                <th className="py-2">Unrealized ({baseCurrency})</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => {
                const costValue = asset.avgPrice * asset.quantity;
                const marketValue = (asset.currentPrice ?? asset.avgPrice) * asset.quantity;
                const unrealized = marketValue - costValue;
                const unrealizedBase = convertCurrency(unrealized, asset.currency, baseCurrency);
                const trendValues = priceHistory[asset.symbol] ?? [];

                return (
                  <tr key={asset.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-2 pr-4 font-medium text-slate-900">{asset.symbol}</td>
                    <td className="py-2 pr-4 capitalize text-slate-600">{asset.assetType}</td>
                    <td className="py-2 pr-4">{numberFormatter.format(asset.avgPrice)}</td>
                    <td className="py-2 pr-4">{numberFormatter.format(asset.quantity)}</td>
                    <td className="py-2 pr-4">{asset.currency}</td>
                    <td className="py-2">
                      {numberFormatter.format(costValue)} {asset.currency}
                    </td>
                    <td className="py-2">
                      {numberFormatter.format(marketValue)} {asset.currency}
                    </td>
                    <td
                      className={
                        unrealized >= 0 ? 'py-2 text-emerald-600' : 'py-2 text-rose-600'
                      }
                    >
                      {numberFormatter.format(unrealized)} {asset.currency}
                    </td>
                    <td className="py-2 pr-4">
                      <PriceSparkline values={trendValues} />
                    </td>
                    <td
                      className={
                        Number.isFinite(unrealizedBase)
                          ? unrealizedBase >= 0
                            ? 'py-2 text-emerald-600'
                            : 'py-2 text-rose-600'
                          : 'py-2'
                      }
                    >
                      {Number.isFinite(unrealizedBase)
                        ? `${numberFormatter.format(unrealizedBase)} ${baseCurrency}`
                        : '--'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
