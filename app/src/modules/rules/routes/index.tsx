import type { AppRoute } from '../../../core/types/routeTypes';
import { registerRoutes } from '../../../core/routeRegistry';
import ProjectRulePage from '../pages/ProjectRulePage';
import CreateRulePage from '../components/CreateRulePage';

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

registerRoutes(rulesRoutes);

export default rulesRoutes;
