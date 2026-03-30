import type { AppRoute } from '@/core/types/routeTypes';
import JdmEditorPage from '../Page/JdmEditorPage';

const jdmEditorRoutes: AppRoute[] = [
  {
    path: '/vertical/:vertical_Key/dashboard/hub/:project_key/rules/editor',
    element: JdmEditorPage,
    layout: 'none',
    metadata: {
      title: 'JDM Editor',
      description: 'JDM Editor page',
    },
  },
];

export default jdmEditorRoutes;

