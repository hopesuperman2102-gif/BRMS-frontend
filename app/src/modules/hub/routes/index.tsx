import type { AppRoute } from '../../../core/types/routeTypes';
import { registerRoutes } from '../../../core/routeRegistry';
import CreateProjectPage from '../components/CreateProjectPage';
import HubPage from '../page/HubPage';
import RulesTable from '../components/RulesTable';
import DeployTabPage from '../../deploy/page/DeployTabPage';

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
    layout: 'main',
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