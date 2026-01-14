export const currencyRates: Record<string, number> = {
  USD: 1,
  VND: 1 / 25000,
  EUR: 1.08,
  GBP: 1.27,
};

export const currencyOptions = Object.keys(currencyRates);

export const numberFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const allocationColors = [
  'bg-slate-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-sky-500',
  'bg-violet-500',
  'bg-rose-500',
];

export const normalizeCryptoSymbol = (symbol: string) => {
  const cleaned = symbol.trim().toUpperCase().replace(/[-/]/g, '');
  const quoteCurrencies = ['USDT', 'USDC', 'BUSD', 'USD', 'BTC', 'ETH', 'BNB'];
  if (quoteCurrencies.some((quote) => cleaned.endsWith(quote))) {
    return cleaned;
  }
  return `${cleaned}USDT`;
};

export const canConvert = (from: string, to: string) =>
  Number.isFinite(currencyRates[from]) && Number.isFinite(currencyRates[to]);

export const convertCurrency = (amount: number, from: string, to: string) => {
  if (!canConvert(from, to)) {
    return Number.NaN;
  }

  return (amount * currencyRates[from]) / currencyRates[to];
};
