import { Link, Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { useApp } from '../providers/AppContext';

export default function AdminLayout() {
  const { theme, setTheme, setLayout } = useApp();

  useEffect(() => {
    setLayout('admin');
  }, [setLayout]);

  return (
    <div>
      <header style={{ display: 'flex', gap: 12, padding: 12 }}>
        <Link to="/">Home</Link>
        <Link to="/admin">Dashboard</Link>
        <Link to="/admin/users">Users</Link>
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
