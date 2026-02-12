import type { AppRoute } from '../../../core/types/routeTypes';
import { registerRoutes } from '../../../core/routeRegistry';
import VerticalSelectionPage from '../../vertical/components/VerticalSelctionComponent';

const authRoutes: AppRoute[] = [
  {
    path: '/vertical',
    element: VerticalSelectionPage,
    layout: 'main',
    metadata: {
      title: 'Vertical Selection',
      description: 'Vertical selection page',
    },
  },

];

registerRoutes(authRoutes);

export default authRoutes;
