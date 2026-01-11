import clsx from 'clsx';

type AllocationItemProps = {
  label: string;
  value: string;
  percent: number;
  colorClassName?: string;
  className?: string;
};

export default function AllocationItem({
  label,
  value,
  percent,
  colorClassName = 'bg-slate-400',
  className,
}: AllocationItemProps) {
  const clampedPercent = Math.min(Math.max(percent, 0), 100);

  return (
    <div className={clsx('space-y-2', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 text-slate-700">
          <span className={clsx('h-2 w-2 rounded-full', colorClassName)} />
          <span className="capitalize">{label}</span>
        </span>
        <span className="text-slate-600">
          {value} • {clampedPercent.toFixed(1)}%
        </span>
      </div>
      <div className="h-2 w-full rounded bg-slate-100">
        <div
          className={clsx('h-2 rounded', colorClassName)}
          style={{ width: `${clampedPercent}%` }}
        />
      </div>
    </div>
  );
}
