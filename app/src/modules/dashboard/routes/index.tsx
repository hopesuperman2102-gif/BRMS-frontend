import type { AppRoute } from '../../../core/types/routeTypes';
import { registerRoutes } from '../../../core/routeRegistry';
import DashboardPage from '../page/DashboardPage';

const dashboardRoutes: AppRoute[] = [
  {
    path: '/dashboard',
    element: DashboardPage,
    layout: 'main',
    metadata: {
      title: 'Dashboard',
      description: 'Main dashboard page',
    },
  },
];

registerRoutes(dashboardRoutes);

export default dashboardRoutes;
