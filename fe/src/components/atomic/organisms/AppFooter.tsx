import clsx from 'clsx';

type AppFooterProps = {
  companyName?: string;
  className?: string;
};

export default function AppFooter({
  companyName = "qal's software",
  className,
}: AppFooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className={clsx('border-t border-slate-200 px-4 py-3 text-xs', className)}>
      <span>© {year} {companyName}</span>
    </footer>
  );
}
