import clsx from 'clsx';
import Brand from '../atoms/Brand';
import PrimaryNav, { NavItem } from '../molecules/PrimaryNav';
import ThemeToggle from '../molecules/ThemeToggle';

type AppHeaderProps = {
  theme: string;
  onToggleTheme: () => void;
  navItems?: NavItem[];
  brandLabel?: string;
  className?: string;
  brandClassName?: string;
  navClassName?: string;
  linkClassName?: string;
  toggleClassName?: string;
};

export default function AppHeader({
  theme,
  onToggleTheme,
  navItems,
  brandLabel,
  className,
  brandClassName,
  navClassName,
  linkClassName,
  toggleClassName,
}: AppHeaderProps) {
  return (
    <header
      className={clsx(
        'flex items-center gap-4 border-b border-slate-200 px-4 py-3',
        className
      )}
    >
      <Brand label={brandLabel} className={brandClassName} />
      <PrimaryNav items={navItems} className={navClassName} linkClassName={linkClassName} />
      <div className="ml-auto">
        <ThemeToggle theme={theme} onToggle={onToggleTheme} className={toggleClassName} />
      </div>
    </header>
  );
}
