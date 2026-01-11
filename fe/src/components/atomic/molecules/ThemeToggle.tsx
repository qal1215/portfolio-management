import clsx from 'clsx';

type ThemeToggleProps = {
  theme: string;
  onToggle: () => void;
  className?: string;
};

export default function ThemeToggle({ theme, onToggle, className }: ThemeToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={clsx(
        'rounded border px-2 py-1 text-xs',
        theme === 'dark' ? 'border-slate-700' : 'border-slate-300',
        className
      )}
    >
      Theme: {theme}
    </button>
  );
}
