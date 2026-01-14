export type CapitalFlowType = 'DEPOSIT' | 'DIVIDEND' | 'PROFIT' | 'REINVEST';

export type CapitalFlow = {
  id: string;
  type: CapitalFlowType;
  amount: number;
  date: string;
  source?: string;
};

export type Transaction = {
  id: string;
  symbol: string;
  quantity: number;
  price: number;
  total: number;
  date: string;
};

export type TransactionFunding = {
  transactionId: string;
  capitalFlowId: string;
  amount: number;
};

export type AssetValue = {
  symbol: string;
  currentValue: number;
};

export type PortfolioTimelinePoint = {
  date: string;
  totalValue: number;
  assetValue: number;
  profit: number;
  reinvested: number;
};
