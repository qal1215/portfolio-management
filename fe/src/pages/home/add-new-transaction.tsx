import { memo, type ChangeEvent, type FormEvent } from 'react';
import { currencyOptions, numberFormatter } from './home.utils';

export type AssetRecord = {
  id: string;
  symbol: string;
  assetType: string;
  avgPrice: number;
  currentPrice?: number;
  quantity: number;
  currency: string;
  note: string;
};

export type AssetFormState = {
  symbol: string;
  assetType: string;
  avgPrice: string;
  quantity: string;
  currency: string;
  note: string;
};

type AddNewTransactionFormProps = {
  form: AssetFormState;
  baseCurrency: string;
  previewCost: number;
  previewMarketValue: number;
  previewMarketValueBase: number;
  error: string;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

const AddNewTransactionForm = ({
  form,
  baseCurrency,
  previewCost,
  previewMarketValue,
  previewMarketValueBase,
  error,
  onChange,
  onSubmit,
}: AddNewTransactionFormProps) => (
  <form
    onSubmit={onSubmit}
    className="space-y-4 rounded border border-slate-200 bg-white p-4 shadow-sm"
  >
    <div className="grid gap-4 md:grid-cols-3">
      <label className="text-sm font-medium text-slate-700">
        Symbol
        <input
          name="symbol"
          value={form.symbol}
          onChange={onChange}
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
          onChange={onChange}
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
          onChange={onChange}
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
          onChange={onChange}
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
          onChange={onChange}
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
          onChange={onChange}
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
);

export default memo(AddNewTransactionForm);
