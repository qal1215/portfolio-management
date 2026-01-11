import clsx from 'clsx';

type BrandProps = {
  label?: string;
  className?: string;
};

export default function Brand({ label = 'Portfolio', className }: BrandProps) {
  return <div className={clsx('font-semibold', className)}>{label}</div>;
}
