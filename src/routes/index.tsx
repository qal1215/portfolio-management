import { createBrowserRouter } from 'react-router-dom';
import { adminRoutes } from './admin.routes';
import { publicRoutes } from './public.routes';
import NotFound from '../pages/NotFound';

export const router = createBrowserRouter([
  publicRoutes,
  adminRoutes,
  { path: '*', element: <NotFound /> },
]);
