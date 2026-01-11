import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useApp } from '../providers/AppContext';
import AppFooter from '../components/atomic/organisms/AppFooter';
import AppHeader from '../components/atomic/organisms/AppHeader';

export default function MainLayout() {
  const { theme, setTheme, setLayout } = useApp();

  useEffect(() => {
    setLayout('main');
  }, [setLayout]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      />

      <main style={{ padding: 16, flex: 1 }}>
        <Outlet />
      </main>

      <AppFooter />
    </div>
  );
}
