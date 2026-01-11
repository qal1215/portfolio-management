import type { RouteObject } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import HomePage from '../pages/home/HomePage';
import LoginPage from '../pages/auth/LoginPage';

export const publicRoutes: RouteObject = {
  path: '/',
  element: <MainLayout />,
  children: [
    { index: true, element: <HomePage /> },
    { path: 'login', element: <LoginPage /> },
  ],
};
