import type { AppRoute } from '@/core/types/routeTypes';

import HubPage from '@/modules/hub/page/HubPage';
import RulesTable from '@/modules/hub/components/RulesTable';
import DeployTabPage from '@/modules/deploy/page/DeployTabPage';
import CreateProjectPage from '@/modules/hub/page/CreateProjectPage';
import LogsPage from '@/modules/hub/components/LogsPage';

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
 {
    path: '/logs',
    element: LogsPage,
    layout: 'main',
    metadata: {
      title: 'Logs',
    },
  },
];
export default hubRoutes;

