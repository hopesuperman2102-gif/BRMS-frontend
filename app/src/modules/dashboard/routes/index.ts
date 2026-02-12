import type { AppRoute } from '../../../core/types/routeTypes';
import { registerRoutes } from '../../../core/routeRegistry';
import Dashboard from '../../dashboard/components/MainDashboard';

const authRoutes: AppRoute[] = [
  {
    path: '/dashboard',
    element: Dashboard,
    layout: 'main',
    metadata: {
      title: 'Dashboard',
      description: 'Dashboard page',
    },
  },

];

registerRoutes(authRoutes);

export default authRoutes;