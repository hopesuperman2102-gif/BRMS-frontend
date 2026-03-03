import type { AppRoute } from '@/core/types/routeTypes';
import JdmEditorWithSimulator from '@/modules/JdmEditorPage/components/JdmEditorWithSimulator';

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

export default jdmEditorRoutes;

