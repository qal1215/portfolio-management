import { useEffect } from 'react';
import { useAppSelector } from '../store/hooks';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const theme = useAppSelector((state) => state.app.theme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return <>{children}</>;
}
