import type {
  AssetValue,
  CapitalFlow,
  CapitalFlowType,
  Transaction,
  TransactionFunding,
} from './portfolio.types';
import type { CapitalFlowData } from './SankeyFlowChart';

const compactFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

const standardFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
});

export const formatVndCompact = (value: number) =>
  Number.isFinite(value) ? `${compactFormatter.format(value)} VND` : '--';

export const formatVnd = (value: number) =>
  Number.isFinite(value) ? `${standardFormatter.format(value)} VND` : '--';

export const flowTypeLabels: Record<CapitalFlowType, string> = {
  DEPOSIT: 'Deposit',
  DIVIDEND: 'Dividend',
  PROFIT: 'Profit',
  REINVEST: 'Reinvest',
};

export const flowTypeOrder: CapitalFlowType[] = [
  'DEPOSIT',
  'DIVIDEND',
  'PROFIT',
  'REINVEST',
];

export const buildSankeyData = (
  flows: CapitalFlow[],
  transactions: Transaction[],
  funding: TransactionFunding[],
  assetValues: AssetValue[]
): CapitalFlowData => {
  const assetValueMap = new Map(assetValues.map((asset) => [asset.symbol, asset.currentValue]));

  const flowNodes = flows.map((flow) => ({
    id: `flow-${flow.id}`,
    label: `${flowTypeLabels[flow.type]} (${formatVndCompact(flow.amount)})`,
  }));

  const transactionNodes = transactions.map((txn) => ({
    id: `txn-${txn.id}`,
    label: `${txn.symbol} buy`,
  }));

  const assetNodes = Array.from(
    new Map(
      transactions.map((txn) => [
        txn.symbol,
        {
          id: `asset-${txn.symbol}`,
          label: `${txn.symbol} now ${formatVndCompact(
            assetValueMap.get(txn.symbol) ?? txn.total
          )}`,
        },
      ])
    ).values()
  );

  // Two-hop Sankey: capital flows -> transactions -> assets (current value in labels).
  const fundingLinks = funding.map((item) => ({
    source: `flow-${item.capitalFlowId}`,
    target: `txn-${item.transactionId}`,
    value: item.amount,
  }));

  const transactionLinks = transactions.map((txn) => ({
    source: `txn-${txn.id}`,
    target: `asset-${txn.symbol}`,
    value: txn.total,
  }));

  return {
    nodes: [...flowNodes, ...transactionNodes, ...assetNodes],
    links: [...fundingLinks, ...transactionLinks],
  };
};
