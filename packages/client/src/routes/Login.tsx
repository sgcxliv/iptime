import { createRoute } from '@tanstack/react-router';
import { rootRoute } from '.';
import { LoginPage } from '../pages/Loginpage'; // Import my LoginPage

export const loginRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/login',
    component: () => <LoginPage /> // Use my LoginPage
});