import type { AppRoute } from '../../../core/types/routeTypes';
import { registerRoutes } from '../../../core/routeRegistry';
import DashboardPage from '../page/DashboardPage';
import CreateProjectPage from '../components/CreateProjectPage';


const dashboardRoutes: AppRoute[] = [
  {
    path: '/dashboard',
    element: DashboardPage,
    layout: 'main',
    metadata: {
      title: 'Dashboard',
    },
  },
  {
    path: '/dashboard/createproject',
    element: CreateProjectPage,
    layout: 'main',
    metadata: {
      title: 'Create Project',
    },
  },
];

registerRoutes(dashboardRoutes);

export default dashboardRoutes;
