import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setLayout, setTheme } from '../store/slices/appSlice';

type Theme = 'light' | 'dark';
type Layout = 'main' | 'admin';

function useApp() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.app.theme);
  const layout = useAppSelector((state) => state.app.layout);

  return {
    theme,
    layout,
    setTheme: (nextTheme: Theme) => dispatch(setTheme(nextTheme)),
    setLayout: (nextLayout: Layout) => dispatch(setLayout(nextLayout)),
  };
}

export { useApp };
export type { Layout, Theme };
