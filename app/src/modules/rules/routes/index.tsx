import type { AppRoute } from '../../../core/types/routeTypes';
import { registerRoutes } from '../../../core/routeRegistry';
import ProjectRulePage from '../pages/ProjectRulePage';
import JdmEditorWithSimulator from '../../JdmEditorPage/components/JdmEditorWithSimulator';
import CreateRulePage from '../components/CreateRulePage';

const rulesRoutes: AppRoute[] = [
  {
    path: '/hub/:project_key/rules',
    element: ProjectRulePage,
    layout: 'main',
    metadata: {
      title: 'Project Rules',
      description: 'View and manage project rules',
    },
  },
  {
    path: '/hub/:project_key/rules/editor',
    element: JdmEditorWithSimulator,
    layout: 'none',
    metadata: {
      title: 'Rule Editor',
      description: 'Edit rules using JDM Editor',
    },
  },
  {
    path: '/hub/:project_key/rules/createrules',
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
