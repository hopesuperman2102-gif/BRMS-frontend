import type { AppRoute } from '../../../core/types/routeTypes';
import { registerRoutes } from '../../../core/routeRegistry';
import VerticalSelectionPage from '../pages/VerticalSelectionPage';


const verticalRoutes: AppRoute[] = [
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

registerRoutes(verticalRoutes);

export default verticalRoutes;