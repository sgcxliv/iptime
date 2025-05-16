import { createRouter, RouterProvider } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { MainLayout } from './components/Layout/MainLayout';
import { AuthLayout } from './components/Layout/AuthLayout';
import { DashboardPage } from './pages/DashboardPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { DocumentDetailPage } from './pages/DocumentDetailPage';
import { GroupsPage } from './pages/GroupsPage';
import { GroupDetailPage } from './pages/GroupDetailPage';
import { JobsPage } from './pages/JobsPage';
import { SearchPage } from './pages/SearchPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { useAuthStore } from './store/authStore';
import { useSocketStore } from './store/socketStore';

// Create a root route
const rootRoute = createRouter({
  routeTree: [
    {
      path: '/',
      component: MainLayout,
      beforeLoad: async () => {
        // Check user authentication
        const authStore = useAuthStore.getState();
        await authStore.checkAuth();
        return {};
      },
      children: [
        {
          path: '/',
          component: DashboardPage,
        },
        {
          path: '/documents',
          component: DocumentsPage,
        },
        {
          path: '/documents/$documentId',
          component: DocumentDetailPage,
        },
        {
          path: '/groups',
          component: GroupsPage,
        },
        {
          path: '/groups/$groupId',
          component: GroupDetailPage,
        },
        {
          path: '/jobs',
          component: JobsPage,
        },
        {
          path: '/search',
          component: SearchPage,
        },
      ],
    },
    {
      path: '/auth',
      component: AuthLayout,
      children: [
        {
          path: '/login',
          component: LoginPage,
        },
        {
          path: '/register',
          component: RegisterPage,
        },
      ],
    },
    {
      path: '*',
      component: NotFoundPage,
    },
  ],
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof rootRoute;
  }
}

export function AppRouter() {
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, checkAuth } = useAuthStore();
  const { connect } = useSocketStore();
  
  useEffect(() => {
    const initApp = async () => {
      await checkAuth();
      setIsLoading(false);
      
      if (isAuthenticated) {
        connect();
      }
    };
    
    initApp();
  }, [checkAuth, connect, isAuthenticated]);
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  return <RouterProvider router={rootRoute} />;
}
