import { Link, Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { useApp } from '../providers/AppContext';

export default function MainLayout() {
  const { theme, setTheme, setLayout } = useApp();

  useEffect(() => {
    setLayout('main');
  }, [setLayout]);

  return (
    <div>
      <header style={{ display: 'flex', gap: 12, padding: 12 }}>
        <Link to="/">Home</Link>
        <Link to="/login">Login</Link>
        <Link to="/admin">Admin</Link>
        <button
          type="button"
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        >
          Theme: {theme}
        </button>
      </header>
      <main style={{ padding: 16 }}>
        <Outlet />
      </main>
    </div>
  );
}
