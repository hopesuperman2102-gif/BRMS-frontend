import type { AppRoute } from '../../../core/types/routeTypes';
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

export default verticalRoutes;
