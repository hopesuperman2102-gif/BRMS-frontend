import type { AppRoute } from '../../../core/types/routeTypes';
import { registerRoutes } from '../../../core/routeRegistry';
import DashboardPage from '../pages/DashboardPage';

const dashboardRoutes: AppRoute[] = [
  {
    path: '/vertical/:verticalId/dashboard',
    element: DashboardPage,
    layout: 'main',
    metadata: {
      title: 'Dashboard',
      description: 'Dashboard page',
    },
  },
];

registerRoutes(dashboardRoutes);

export default dashboardRoutes;