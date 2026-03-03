import type { AppRoute } from '@/core/types/routeTypes';
import ProjectRulePage from '@/modules/rules/pages/ProjectRulePage';
import CreateRulePage from '@/modules/rules/pages/CreateRulePage';

const rulesRoutes: AppRoute[] = [
  {
    path: '/vertical/:vertical_Key/dashboard/hub/:project_key/rules',
    element: ProjectRulePage,
    layout: 'main',
    metadata: {
      title: 'Project Rules',
      description: 'View and manage project rules',
    },
  },

  {
    path: '/vertical/:vertical_Key/dashboard/hub/:project_key/rules/createrules',
    element: CreateRulePage,
    layout: 'none',
    metadata: {
      title: 'Create Rule',
      description: 'Create a new rule for the project',
    },
  },
];

export default rulesRoutes;

