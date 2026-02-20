import type { AppRoute } from '../../../core/types/routeTypes';
import { registerRoutes } from '../../../core/routeRegistry';

import HubPage from '../page/HubPage';
import RulesTable from '../components/RulesTable';
import DeployTabPage from '../../deploy/page/DeployTabPage';
import CreateProjectPage from '../page/CreateProjectPage';

const hubRoutes: AppRoute[] = [
  {
    path: '/vertical/:vertical_Key/dashboard/hub',
    element: HubPage,
    layout: 'main',
    metadata: {
      title: 'Hub',
    },
  },
  {
    path: '/vertical/:vertical_Key/dashboard/hub/createproject',
    element: CreateProjectPage,
    layout: 'none',
    metadata: {
      title: 'Create Project',
    },
  },
  {
    path: '/vertical/:vertical_Key/dashboard/hub/allrules',
    element: RulesTable,
    layout: 'main',
    metadata: {
      title: 'Rules Table',
    },
  },
  {
    path: '/vertical/:verticalId/dashboard/hub/deploy',
    element: DeployTabPage,
    layout: 'main',
    metadata: {
      title: 'Deploy',
    },
  },
];

registerRoutes(hubRoutes);
export default hubRoutes;