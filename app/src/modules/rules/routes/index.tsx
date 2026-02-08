import type { AppRoute } from '../../../core/types/routeTypes';
import { registerRoutes } from '../../../core/routeRegistry';
import ProjectRulePage from '../pages/ProjectRulePage';
import JdmEditorWithSimulator from '../../JdmEditorPage/components/JdmEditorWithSimulator';

const rulesRoutes: AppRoute[] = [
  {
    path: '/dashboard/:project_key/rules',
    element: ProjectRulePage,
    layout: 'main',
    metadata: {
      title: 'Project Rules',
      description: 'View and manage project rules',
    },
  },
  {
    path: '/dashboard/:project_key/rules/editor',
    element: JdmEditorWithSimulator,
    layout: 'none',
    metadata: {
      title: 'Rule Editor',
      description: 'Edit rules using JDM Editor',
    },
  },
];

registerRoutes(rulesRoutes);

export default rulesRoutes;
