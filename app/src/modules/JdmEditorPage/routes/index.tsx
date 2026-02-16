import type { AppRoute } from '../../../core/types/routeTypes';
import { registerRoutes } from '../../../core/routeRegistry';
import JdmEditorWithSimulator from '../components/JdmEditorWithSimulator';

const jdmEditorRoutes: AppRoute[] = [
  {
    path: '/vertical/:vertical_Key/dashboard/hub/:project_key/rules/editor',
    element: JdmEditorWithSimulator,
    layout: 'none',
    metadata: {
      title: 'JDM Editor',
      description: 'JDM Editor page',
    },
  },
];

registerRoutes(jdmEditorRoutes);

export default jdmEditorRoutes;
