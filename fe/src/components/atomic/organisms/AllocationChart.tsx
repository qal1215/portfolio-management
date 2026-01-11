import clsx from 'clsx';
import AllocationItem from '../molecules/AllocationItem';

export type AllocationChartItem = {
  id: string;
  label: string;
  value: number;
  valueText: string;
  percent: number;
  colorClassName?: string;
};

type AllocationChartProps = {
  title?: string;
  totalLabel?: string;
  totalValue?: string;
  items: AllocationChartItem[];
  emptyLabel?: string;
  className?: string;
};

export default function AllocationChart({
  title = 'Allocation',
  totalLabel = 'Total',
  totalValue,
  items,
  emptyLabel = 'No allocation data yet.',
  className,
}: AllocationChartProps) {
  return (
    <section className={clsx('space-y-4 rounded border border-slate-200 bg-white p-4', className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">{title}</h2>
        {totalValue ? (
          <span className="text-sm text-slate-500">
            {totalLabel}: {totalValue}
          </span>
        ) : null}
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-slate-500">{emptyLabel}</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <AllocationItem
              key={item.id}
              label={item.label}
              value={item.valueText}
              percent={item.percent}
              colorClassName={item.colorClassName}
            />
          ))}
        </div>
      )}
    </section>
  );
}
