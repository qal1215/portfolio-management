import { useEffect, useMemo, useState } from 'react';
import AssetSummaryPanel, { type AssetSummary } from './AssetSummaryPanel';
import PortfolioOverviewCards from './PortfolioOverviewCards';
import SankeyFlowChart from './SankeyFlowChart';
import TransactionBreakdownTable, {
  type TransactionFundingRow,
} from './TransactionBreakdownTable';
import WealthTimelineChart from './WealthTimelineChart';
import type {
  AssetValue,
  CapitalFlow,
  CapitalFlowType,
  PortfolioTimelinePoint,
  Transaction,
  TransactionFunding,
} from './portfolio.types';
import { buildSankeyData, flowTypeLabels, flowTypeOrder, formatVnd } from './portfolio.utils';

const dataUrls = {
  capitalFlows: '/mock/capital_flow.json',
  transactions: '/mock/transactions.json',
  transactionFunding: '/mock/transaction_funding.json',
  assetValues: '/mock/asset_values.json',
  timeline: '/mock/wealth_timeline.json',
};

const emptyFundingByType: Record<CapitalFlowType, number> = {
  DEPOSIT: 0,
  DIVIDEND: 0,
  PROFIT: 0,
  REINVEST: 0,
};

export default function HomePage() {
  const [capitalFlows, setCapitalFlows] = useState<CapitalFlow[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionFunding, setTransactionFunding] = useState<TransactionFunding[]>([]);
  const [assetValues, setAssetValues] = useState<AssetValue[]>([]);
  const [timeline, setTimeline] = useState<PortfolioTimelinePoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadData = async () => {
      try {
        const [
          capitalFlowResponse,
          transactionResponse,
          fundingResponse,
          assetResponse,
          timelineResponse,
        ] = await Promise.all([
          fetch(dataUrls.capitalFlows),
          fetch(dataUrls.transactions),
          fetch(dataUrls.transactionFunding),
          fetch(dataUrls.assetValues),
          fetch(dataUrls.timeline),
        ]);

        if (
          !capitalFlowResponse.ok ||
          !transactionResponse.ok ||
          !fundingResponse.ok ||
          !assetResponse.ok ||
          !timelineResponse.ok
        ) {
          throw new Error('Mock data is missing.');
        }

        const [capitalFlowData, transactionData, fundingData, assetData, timelineData] =
          await Promise.all([
            capitalFlowResponse.json(),
            transactionResponse.json(),
            fundingResponse.json(),
            assetResponse.json(),
            timelineResponse.json(),
          ]);

        if (!isActive) {
          return;
        }

        setCapitalFlows(capitalFlowData);
        setTransactions(transactionData);
        setTransactionFunding(fundingData);
        setAssetValues(assetData);
        setTimeline(timelineData);
      } catch (error) {
        if (isActive) {
          setLoadError('Unable to load portfolio mock data.');
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isActive = false;
    };
  }, []);

  const totalDeposited = useMemo(
    () =>
      capitalFlows.reduce(
        (sum, flow) => (flow.type === 'DEPOSIT' ? sum + flow.amount : sum),
        0
      ),
    [capitalFlows]
  );
  const totalProfit = useMemo(
    () =>
      capitalFlows.reduce(
        (sum, flow) =>
          flow.type === 'PROFIT' || flow.type === 'DIVIDEND' ? sum + flow.amount : sum,
        0
      ),
    [capitalFlows]
  );
  const hasSankeyData =
    capitalFlows.length > 0 && transactions.length > 0 && transactionFunding.length > 0;
  const hasTimelineData = timeline.length > 0;
  const latestTimeline = timeline[timeline.length - 1];
  const totalAssetValue =
    latestTimeline?.totalValue ??
    assetValues.reduce((sum, asset) => sum + asset.currentValue, 0);
  const roi = totalDeposited > 0 ? (totalProfit / totalDeposited) * 100 : Number.NaN;

  const sankeyData = useMemo(
    () => buildSankeyData(capitalFlows, transactions, transactionFunding, assetValues),
    [assetValues, capitalFlows, transactionFunding, transactions]
  );

  const assetSummaries = useMemo<AssetSummary[]>(() => {
    const costBySymbol = new Map<string, number>();
    transactions.forEach((txn) => {
      costBySymbol.set(txn.symbol, (costBySymbol.get(txn.symbol) ?? 0) + txn.total);
    });

    const valueBySymbol = new Map(assetValues.map((asset) => [asset.symbol, asset.currentValue]));

    return Array.from(costBySymbol.entries())
      .map(([symbol, cost]) => {
        const currentValue = valueBySymbol.get(symbol) ?? cost;
        const delta = currentValue - cost;
        const deltaPercent = cost > 0 ? (delta / cost) * 100 : 0;

        return {
          symbol,
          cost,
          currentValue,
          delta,
          deltaPercent,
        };
      })
      .sort((a, b) => b.currentValue - a.currentValue);
  }, [assetValues, transactions]);

  const transactionRows = useMemo<TransactionFundingRow[]>(() => {
    const flowById = new Map(capitalFlows.map((flow) => [flow.id, flow]));

    return transactions
      .map((txn) => {
        const fundingByType: Record<CapitalFlowType, number> = { ...emptyFundingByType };
      const fundingSources = transactionFunding
        .filter((item) => item.transactionId === txn.id)
        .map((item) => {
          const flow = flowById.get(item.capitalFlowId);
          if (flow) {
            fundingByType[flow.type] += item.amount;
          }

          return {
            id: item.capitalFlowId,
            type: flow?.type ?? 'DEPOSIT',
            amount: item.amount,
            date: flow?.date ?? txn.date,
            source: flow?.source,
          };
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        return {
          id: txn.id,
          symbol: txn.symbol,
          date: txn.date,
          quantity: txn.quantity,
          price: txn.price,
          total: txn.total,
          fundingByType,
          fundingSources,
        };
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [capitalFlows, transactionFunding, transactions]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f6f4ef]">
      <div className="pointer-events-none absolute -top-32 right-[-10%] h-96 w-96 rounded-full bg-[#a7f3d0] opacity-40 blur-3xl float-slow" />
      <div className="pointer-events-none absolute bottom-[-20%] left-[-10%] h-[28rem] w-[28rem] rounded-full bg-[#bfdbfe] opacity-50 blur-3xl float-slower" />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10">
        <header className="flex flex-col gap-3 fade-up">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Portfolio Intelligence
          </div>
          <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">
            Investment Capital Flow
          </h1>
          <p className="max-w-2xl text-sm text-slate-600 md:text-base">
            A clear view of deposits, reinvested profits, and how capital is allocated into
            assets over time.
          </p>
        </header>

        <PortfolioOverviewCards
          totalAssetValue={totalAssetValue}
          totalDeposited={totalDeposited}
          totalProfit={totalProfit}
          roi={roi}
        />

        <section
          className="grid gap-6 fade-up lg:grid-cols-[2fr_1fr]"
          style={{ animationDelay: '120ms' }}
        >
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Capital Flow</h2>
                <p className="text-sm text-slate-500">
                  Sankey links encode deployment size. Node labels show current asset value.
                </p>
              </div>
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">VND</div>
            </div>

            {isLoading ? (
              <div className="flex h-[420px] items-center justify-center text-sm text-slate-400">
                Loading capital flow...
              </div>
            ) : loadError ? (
              <div className="flex h-[420px] items-center justify-center text-sm text-rose-500">
                {loadError}
              </div>
            ) : !hasSankeyData ? (
              <div className="flex h-[420px] items-center justify-center text-sm text-slate-400">
                No capital flow data available.
              </div>
            ) : (
              <SankeyFlowChart data={sankeyData} />
            )}
          </div>

          <div className="space-y-6">
            <AssetSummaryPanel assets={assetSummaries} />
            <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 text-sm text-slate-500 shadow-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Capital mix</p>
              <div className="mt-3 space-y-2">
                {flowTypeOrder.map((type) => {
                  const total = capitalFlows
                    .filter((flow) => flow.type === type)
                    .reduce((sum, flow) => sum + flow.amount, 0);

                  return (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">{flowTypeLabels[type]}</span>
                      <span className="text-sm font-semibold text-slate-900">
                        {formatVnd(total)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="fade-up" style={{ animationDelay: '200ms' }}>
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">NAV Growth</h2>
                <p className="text-sm text-slate-500">
                  Line shows total portfolio value. Tooltip breaks down profit and reinvested
                  capital.
                </p>
              </div>
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Monthly
              </div>
            </div>

            {isLoading ? (
              <div className="flex h-[320px] items-center justify-center text-sm text-slate-400">
                Loading timeline...
              </div>
            ) : loadError ? (
              <div className="flex h-[320px] items-center justify-center text-sm text-rose-500">
                {loadError}
              </div>
            ) : !hasTimelineData ? (
              <div className="flex h-[320px] items-center justify-center text-sm text-slate-400">
                No timeline data available.
              </div>
            ) : (
              <WealthTimelineChart data={timeline} />
            )}
          </div>
        </section>

        <section className="fade-up" style={{ animationDelay: '260ms' }}>
          {isLoading ? (
            <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 text-sm text-slate-400">
              Loading transactions...
            </div>
          ) : loadError ? (
            <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 text-sm text-rose-500">
              {loadError}
            </div>
          ) : (
            <TransactionBreakdownTable rows={transactionRows} />
          )}
        </section>
      </div>
    </div>
  );
}
