import type { AppRoute } from '../../../core/types/routeTypes';
import { registerRoutes } from '../../../core/routeRegistry';
import DashboardPage from '../pages/DashboardPage';

const authRoutes: AppRoute[] = [
  {
    path: '/dashboard',
    element: DashboardPage,
    layout: 'main',
    metadata: {
      title: 'Dashboard',
      description: 'Dashboard page',
    },
  },

];

registerRoutes(authRoutes);

export default authRoutes;