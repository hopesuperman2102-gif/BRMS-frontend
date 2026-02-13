import type { AppRoute } from '../../../core/types/routeTypes';
import { registerRoutes } from '../../../core/routeRegistry';
import CreateProjectPage from '../components/CreateProjectPage';
import HubPage from '../page/HubPage';

const hubRoutes: AppRoute[] = [
  {
    path: '/vertical/:verticalId/dashboard/hub',
    element: HubPage,
    layout: 'main',
    metadata: {
      title: 'Hub',
    },
  },
  {
    path: '/vertical/:verticalId/dashboard/hub/createproject',
    element: CreateProjectPage,
    layout: 'main',
    metadata: {
      title: 'Create Project',
    },
  },
];

registerRoutes(hubRoutes);
export default hubRoutes;