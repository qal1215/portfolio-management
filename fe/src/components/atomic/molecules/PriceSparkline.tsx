import clsx from 'clsx';

type PriceSparklineProps = {
  values: number[];
  width?: number;
  height?: number;
  className?: string;
};

export default function PriceSparkline({
  values,
  width = 120,
  height = 32,
  className,
}: PriceSparklineProps) {
  const data = values.filter((value) => Number.isFinite(value));
  if (data.length === 0) {
    return <span className={clsx('text-xs text-slate-400', className)}>--</span>;
  }

  const series = data.length === 1 ? [data[0], data[0]] : data;
  const min = Math.min(...series);
  const max = Math.max(...series);
  const range = max - min || 1;

  const points = series
    .map((value, index) => {
      const x = (index / (series.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={clsx('text-slate-500', className)}
      aria-label="Price trend"
      role="img"
    >
      <polyline fill="none" stroke="currentColor" strokeWidth="2" points={points} />
    </svg>
  );
}
