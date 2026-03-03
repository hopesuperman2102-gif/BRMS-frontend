import type { AppRoute } from '@/core/types/routeTypes';
import DashboardPage from '@/modules/dashboard/pages/DashboardPage';

const dashboardRoutes: AppRoute[] = [
  {
    path: '/vertical/:vertical_Key/dashboard',
    element: DashboardPage,
    layout: 'main',
    metadata: {
      title: 'Dashboard',
      description: 'Dashboard page',
    },
  },
];

export default dashboardRoutes;

