import { useState } from 'react';
import type { CapitalFlowType } from './portfolio.types';
import { flowTypeLabels, flowTypeOrder, formatVnd } from './portfolio.utils';

export type TransactionFundingRow = {
  id: string;
  symbol: string;
  date: string;
  quantity: number;
  price: number;
  total: number;
  fundingByType: Record<CapitalFlowType, number>;
  fundingSources: Array<{
    id: string;
    type: CapitalFlowType;
    amount: number;
    date: string;
    source?: string;
  }>;
};

const fundingColors: Record<CapitalFlowType, string> = {
  DEPOSIT: 'bg-slate-900',
  DIVIDEND: 'bg-emerald-500',
  PROFIT: 'bg-amber-500',
  REINVEST: 'bg-sky-500',
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

export default function TransactionBreakdownTable({
  rows,
}: {
  rows: TransactionFundingRow[];
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Transaction Funding</h3>
        <p className="text-sm text-slate-500">
          Each transaction is mapped to its deposit, profit, dividend, or reinvested sources.
        </p>
        <div className="mt-3 flex flex-wrap gap-3 text-[11px] uppercase tracking-wide text-slate-400">
          {flowTypeOrder.map((type) => (
            <span key={`legend-${type}`} className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${fundingColors[type]}`} />
              {flowTypeLabels[type]}
            </span>
          ))}
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-slate-400">No transactions loaded yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="py-2 pr-4">Symbol</th>
                <th className="py-2 pr-4">Trade date</th>
                <th className="py-2 pr-4">Quantity</th>
                <th className="py-2 pr-4">Price</th>
                <th className="py-2 pr-4">Total</th>
                <th className="py-2 pr-4">Funding mix</th>
                <th className="py-2">Details</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const fundingTotal = Object.values(row.fundingByType).reduce(
                  (sum, value) => sum + value,
                  0
                );
                const isExpanded = expandedId === row.id;

                return (
                  <tr key={row.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-3 pr-4 font-semibold text-slate-900">{row.symbol}</td>
                    <td className="py-3 pr-4 text-slate-600">{formatDate(row.date)}</td>
                    <td className="py-3 pr-4 text-slate-600">{row.quantity}</td>
                    <td className="py-3 pr-4 text-slate-600">{formatVnd(row.price)}</td>
                    <td className="py-3 pr-4 text-slate-900">{formatVnd(row.total)}</td>
                    <td className="py-3 pr-4">
                      <div className="flex h-2 w-44 overflow-hidden rounded-full bg-slate-100">
                      {flowTypeOrder.map((type) => {
                        const amount = row.fundingByType[type];
                        if (amount <= 0 || fundingTotal === 0) {
                          return null;
                        }

                          return (
                            <div
                              key={`${row.id}-${type}`}
                              className={fundingColors[type]}
                              style={{ width: `${(amount / fundingTotal) * 100}%` }}
                            />
                          );
                        })}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2 text-[11px] uppercase tracking-wide text-slate-400">
                      {flowTypeOrder.map((type) =>
                        row.fundingByType[type] > 0 ? (
                          <span key={`${row.id}-${type}-label`}>
                            {flowTypeLabels[type]} {formatVnd(row.fundingByType[type])}
                            </span>
                          ) : null
                        )}
                      </div>
                    </td>
                    <td className="py-3 text-slate-600">
                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : row.id)}
                        className="text-xs font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-900"
                      >
                        {isExpanded ? 'Hide' : 'View'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {rows.map((row) => {
        const isExpanded = expandedId === row.id;
        if (!isExpanded) {
          return null;
        }

        return (
          <div key={`${row.id}-detail`} className="mt-4 rounded-2xl bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Funding sources for {row.symbol}
            </p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {row.fundingSources.map((source) => (
                <div
                  key={`${row.id}-${source.id}`}
                  className="rounded-xl border border-slate-200 bg-white p-3 text-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">
                      {flowTypeLabels[source.type]}
                    </span>
                    <span className="text-slate-700">{formatVnd(source.amount)}</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {formatDate(source.date)} {source.source ? `• ${source.source}` : ''}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
