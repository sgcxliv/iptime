import { createRoute } from '@tanstack/react-router';
import { authenticatedRoute } from '.';
import DashboardPage from '../pages/DashboardPage';

export const dashboardRoute = createRoute({
    getParentRoute: () => authenticatedRoute,
    path: '/dashboard',
    component: DashboardPage // Use my DashboardPage component
});