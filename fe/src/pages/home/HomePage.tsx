import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import AllocationChart, {
  type AllocationChartItem,
} from '../../components/atomic/organisms/AllocationChart';
import PriceSparkline from '../../components/atomic/molecules/PriceSparkline';

type AssetFormState = {
  symbol: string;
  assetType: string;
  avgPrice: string;
  quantity: string;
  currency: string;
  note: string;
};

type AssetRecord = {
  id: string;
  symbol: string;
  assetType: string;
  avgPrice: number;
  currentPrice?: number;
  quantity: number;
  currency: string;
  note: string;
};

const defaultFormState: AssetFormState = {
  symbol: '',
  assetType: 'stock',
  avgPrice: '',
  quantity: '',
  currency: 'USD',
  note: '',
};

const currencyRates: Record<string, number> = {
  USD: 1,
  VND: 1 / 25000,
  EUR: 1.08,
  GBP: 1.27,
};

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
const priceRefreshIntervalMs = 15000;

const currencyOptions = Object.keys(currencyRates);

const numberFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const allocationColors = [
  'bg-slate-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-sky-500',
  'bg-violet-500',
  'bg-rose-500',
];

const normalizeCryptoSymbol = (symbol: string) => {
  const cleaned = symbol.trim().toUpperCase().replace(/[-/]/g, '');
  const quoteCurrencies = ['USDT', 'USDC', 'BUSD', 'USD', 'BTC', 'ETH', 'BNB'];
  if (quoteCurrencies.some((quote) => cleaned.endsWith(quote))) {
    return cleaned;
  }
  return `${cleaned}USDT`;
};

const canConvert = (from: string, to: string) =>
  Number.isFinite(currencyRates[from]) && Number.isFinite(currencyRates[to]);

const convertCurrency = (amount: number, from: string, to: string) => {
  if (!canConvert(from, to)) {
    return Number.NaN;
  }

  return (amount * currencyRates[from]) / currencyRates[to];
};

export default function HomePage() {
  const [form, setForm] = useState<AssetFormState>(defaultFormState);
  const [assets, setAssets] = useState<AssetRecord[]>([]);
  const [error, setError] = useState('');
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [isPriceSyncing, setIsPriceSyncing] = useState(false);
  const [lastPriceSync, setLastPriceSync] = useState<string | null>(null);
  const [priceSyncError, setPriceSyncError] = useState('');
  const [cryptoSubscriptionStatus, setCryptoSubscriptionStatus] = useState('idle');
  const [cryptoSubscriptionInfo, setCryptoSubscriptionInfo] = useState('');
  const [priceHistory, setPriceHistory] = useState<Record<string, number[]>>({});
  const assetsRef = useRef<AssetRecord[]>(assets);
  const lastCryptoSubscription = useRef('');

  useEffect(() => {
    assetsRef.current = assets;
  }, [assets]);

  useEffect(() => {
    const cryptoPairs = Array.from(
      new Set(
        assets
          .filter((asset) => asset.assetType === 'crypto')
          .map((asset) => normalizeCryptoSymbol(asset.symbol))
      )
    ).sort();

    const subscriptionKey = cryptoPairs.join(',');
    if (!subscriptionKey || subscriptionKey === lastCryptoSubscription.current) {
      return;
    }

    lastCryptoSubscription.current = subscriptionKey;
    setCryptoSubscriptionStatus('subscribing');
    setCryptoSubscriptionInfo(subscriptionKey);

    fetch(
      `${apiBaseUrl}/api/crypto/subscribe?symbols=${encodeURIComponent(subscriptionKey)}`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error('Subscribe failed');
        }
        setCryptoSubscriptionStatus('subscribed');
      })
      .catch(() => {
        setCryptoSubscriptionStatus('failed');
        setPriceSyncError('Failed to subscribe to crypto prices.');
      });
  }, [assets]);

  const previewCost = Number(form.avgPrice) * Number(form.quantity);
  const previewMarketValue = Number(form.avgPrice) * Number(form.quantity);
  const previewMarketValueBase = convertCurrency(
    previewMarketValue,
    form.currency,
    baseCurrency
  );
  const totalCostBase = assets.reduce((sum, asset) => {
    const costValue = asset.avgPrice * asset.quantity;
    const converted = convertCurrency(costValue, asset.currency, baseCurrency);
    return Number.isFinite(converted) ? sum + converted : sum;
  }, 0);
  const totalMarketValueBase = assets.reduce((sum, asset) => {
    const marketValue = (asset.currentPrice ?? asset.avgPrice) * asset.quantity;
    const converted = convertCurrency(marketValue, asset.currency, baseCurrency);
    return Number.isFinite(converted) ? sum + converted : sum;
  }, 0);
  const totalUnrealizedBase = totalMarketValueBase - totalCostBase;
  const hasMissingRates = assets.some((asset) => !canConvert(asset.currency, baseCurrency));

  const allocationByType = assets.reduce<Record<string, number>>((acc, asset) => {
    const marketValue = (asset.currentPrice ?? asset.avgPrice) * asset.quantity;
    const converted = convertCurrency(marketValue, asset.currency, baseCurrency);
    if (!Number.isFinite(converted)) {
      return acc;
    }

    acc[asset.assetType] = (acc[asset.assetType] ?? 0) + converted;
    return acc;
  }, {});

  const allocationTotal = Object.values(allocationByType).reduce(
    (sum, value) => sum + value,
    0
  );

  const allocationItems: AllocationChartItem[] = Object.entries(allocationByType).map(
    ([type, value], index) => ({
      id: type,
      label: type,
      value,
      valueText: `${numberFormatter.format(value)} ${baseCurrency}`,
      percent: allocationTotal > 0 ? (value / allocationTotal) * 100 : 0,
      colorClassName: allocationColors[index % allocationColors.length],
    })
  );

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    const symbol = form.symbol.trim().toUpperCase();
    const avgPriceValue = Number(form.avgPrice);
    const quantityValue = Number(form.quantity);

    if (!symbol) {
      setError('Symbol is required.');
      return;
    }

    if (!Number.isFinite(avgPriceValue) || avgPriceValue <= 0) {
      setError('Average price must be a positive number.');
      return;
    }

    if (!Number.isFinite(quantityValue) || quantityValue <= 0) {
      setError('Quantity must be a positive number.');
      return;
    }

    const nextAsset: AssetRecord = {
      id: `${Date.now()}`,
      symbol,
      assetType: form.assetType,
      avgPrice: avgPriceValue,
      quantity: quantityValue,
      currency: form.currency,
      note: form.note.trim(),
    };

    setAssets((prev) => [nextAsset, ...prev]);
    setForm((prev) => ({
      ...defaultFormState,
      assetType: prev.assetType,
      currency: prev.currency,
    }));
  };

  useEffect(() => {
    let isActive = true;

    const refreshPrices = async () => {
      const currentAssets = assetsRef.current;
      if (currentAssets.length === 0) {
        return;
      }

      setIsPriceSyncing(true);
      setPriceSyncError('');

      const stockSymbols = Array.from(
        new Set(
          currentAssets
            .filter((asset) => asset.assetType !== 'crypto')
            .map((asset) => asset.symbol)
        )
      );
      const cryptoPairsBySymbol = new Map<string, string>();
      const cryptoSymbols = Array.from(
        new Set(
          currentAssets
            .filter((asset) => asset.assetType === 'crypto')
            .map((asset) => {
              const pair = normalizeCryptoSymbol(asset.symbol);
              cryptoPairsBySymbol.set(asset.symbol, pair);
              return pair;
            })
        )
      );

      const priceMap = new Map<string, number>();
      const cryptoPriceMap = new Map<string, number>();

      try {
        const stockResults = await Promise.allSettled(
          stockSymbols.map(async (symbol) => {
            const response = await fetch(
              `${apiBaseUrl}/api/stock/quote?symbol=${encodeURIComponent(symbol)}`
            );
            if (!response.ok) {
              throw new Error(`Stock quote failed for ${symbol}`);
            }
            const data: { price?: number | string; symbol?: string } = await response.json();
            const price = Number(data.price);
            return { symbol, price };
          })
        );

        stockResults.forEach((result) => {
          if (result.status === 'fulfilled' && Number.isFinite(result.value.price)) {
            priceMap.set(result.value.symbol, result.value.price);
          }
        });

        if (cryptoSymbols.length > 0) {
          const response = await fetch(
            `${apiBaseUrl}/api/crypto/prices?symbols=${encodeURIComponent(
              cryptoSymbols.join(',')
            )}`
          );
          if (response.ok) {
            const data: {
              data?: Array<{ symbol: string; price: number | string | null }>;
            } = await response.json();

            data.data?.forEach((item) => {
              const price = Number(item.price);
              if (Number.isFinite(price)) {
                cryptoPriceMap.set(item.symbol, price);
              }
            });
          }
        }

        if (!isActive) {
          return;
        }

        if (priceMap.size > 0 || cryptoPriceMap.size > 0) {
          const updates = currentAssets.flatMap((asset) => {
            const nextPrice =
              asset.assetType === 'crypto'
                ? cryptoPriceMap.get(cryptoPairsBySymbol.get(asset.symbol) ?? asset.symbol)
                : priceMap.get(asset.symbol);

            if (!Number.isFinite(nextPrice)) {
              return [];
            }

            return [{ symbol: asset.symbol, price: nextPrice }];
          });

          if (updates.length > 0) {
            setPriceHistory((prev) => {
              const next = { ...prev };
              updates.forEach(({ symbol, price }) => {
                const history = next[symbol] ?? [];
                const lastPrice = history[history.length - 1];
                if (lastPrice === price) {
                  return;
                }
                next[symbol] = [...history, price].slice(-24);
              });
              return next;
            });
          }

          setAssets((prev) =>
            prev.map((asset) => {
              const nextPrice =
                asset.assetType === 'crypto'
                  ? cryptoPriceMap.get(cryptoPairsBySymbol.get(asset.symbol) ?? asset.symbol)
                  : priceMap.get(asset.symbol);
              if (!Number.isFinite(nextPrice)) {
                return asset;
              }
              if (asset.currentPrice === nextPrice) {
                return asset;
              }
              return { ...asset, currentPrice: nextPrice };
            })
          );
        }

        setLastPriceSync(new Date().toISOString());
      } catch (syncError) {
        if (isActive) {
          setPriceSyncError('Failed to refresh prices. Check backend connection.');
        }
      } finally {
        if (isActive) {
          setIsPriceSyncing(false);
        }
      }
    };

    refreshPrices();
    const intervalId = setInterval(refreshPrices, priceRefreshIntervalMs);

    return () => {
      isActive = false;
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Asset Management</h1>
        <p className="text-sm text-slate-600">
          Track your holdings with symbol, average price, and quantity.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded border border-slate-200 bg-white p-4 shadow-sm"
      >
        <div className="grid gap-4 md:grid-cols-3">
          <label className="text-sm font-medium text-slate-700">
            Symbol
            <input
              name="symbol"
              value={form.symbol}
              onChange={handleChange}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
              placeholder="AAPL"
              autoComplete="off"
              required
            />
          </label>

          <label className="text-sm font-medium text-slate-700">
            Asset type
            <select
              name="assetType"
              value={form.assetType}
              onChange={handleChange}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="stock">Stock</option>
              <option value="crypto">Crypto</option>
              <option value="fund">Fund</option>
              <option value="bond">Bond</option>
              <option value="cash">Cash</option>
            </select>
          </label>

          <label className="text-sm font-medium text-slate-700">
            Currency
            <select
              name="currency"
              value={form.currency}
              onChange={handleChange}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
            >
              {currencyOptions.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="text-sm font-medium text-slate-700">
            Average price
            <input
              name="avgPrice"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={form.avgPrice}
              onChange={handleChange}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
              placeholder="185.25"
              required
            />
          </label>

          <label className="text-sm font-medium text-slate-700">
            Quantity
            <input
              name="quantity"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.00000000000001"
              value={form.quantity}
              onChange={handleChange}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
              placeholder="10"
              required
            />
          </label>

          <label className="text-sm font-medium text-slate-700">
            Note
            <input
              name="note"
              value={form.note}
              onChange={handleChange}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
              placeholder="Long-term holding"
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1 text-sm text-slate-600">
            <div>
              Cost value:{' '}
              <span className="font-medium text-slate-900">
                {Number.isFinite(previewCost)
                  ? `${numberFormatter.format(previewCost)} ${form.currency}`
                  : '--'}
              </span>
            </div>
            <div>
              Market value:{' '}
              <span className="font-medium text-slate-900">
                {Number.isFinite(previewMarketValue)
                  ? `${numberFormatter.format(previewMarketValue)} ${form.currency}`
                  : '--'}
              </span>
              {Number.isFinite(previewMarketValueBase) ? (
                <span className="ml-2 text-slate-500">
                  ({numberFormatter.format(previewMarketValueBase)} {baseCurrency})
                </span>
              ) : null}
            </div>
          </div>
          <button
            type="submit"
            className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Add asset
          </button>
        </div>

        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      </form>

      <AllocationChart
        title="Allocation by Asset Type"
        totalLabel="Total value"
        totalValue={`${numberFormatter.format(allocationTotal)} ${baseCurrency}`}
        items={allocationItems}
      />

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
            <span>
              {isPriceSyncing
                ? 'Syncing prices...'
                : lastPriceSync
                  ? `Last sync: ${new Date(lastPriceSync).toLocaleTimeString()}`
                  : 'Last sync: --'}
            </span>
            <label className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-400">
              Base
              <select
                value={baseCurrency}
                onChange={(event) => setBaseCurrency(event.target.value)}
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
                        className={unrealized >= 0 ? 'py-2 text-emerald-600' : 'py-2 text-rose-600'}
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
    </div>
  );
}
