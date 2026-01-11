import clsx from 'clsx';
import { Link } from 'react-router-dom';

export type NavItem = {
  to: string;
  label: string;
};

const defaultItems: NavItem[] = [
  { to: '/', label: 'Home' },
  { to: '/login', label: 'Login' },
  { to: '/admin', label: 'Admin' },
];

type PrimaryNavProps = {
  items?: NavItem[];
  className?: string;
  linkClassName?: string;
};

export default function PrimaryNav({
  items = defaultItems,
  className,
  linkClassName,
}: PrimaryNavProps) {
  return (
    <nav className={clsx('flex gap-3 text-sm', className)}>
      {items.map((item) => (
        <Link key={item.to} to={item.to} className={clsx('hover:underline', linkClassName)}>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
