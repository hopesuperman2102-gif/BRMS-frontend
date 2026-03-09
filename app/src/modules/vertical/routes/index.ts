import type { AppRoute } from '@/core/types/routeTypes';
import VerticalSelectionPage from '@/modules/vertical/pages/VerticalSelectionPage';


const verticalRoutes: AppRoute[] = [
  {
    path: '/vertical',
    element: VerticalSelectionPage,
    fixed: true,
    layout: 'main',
    metadata: {
      title: 'Vertical Selection',
      description: 'Vertical selection page',
    },
  },
];

export default verticalRoutes;

