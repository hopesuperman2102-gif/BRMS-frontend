import type { AppRoute } from '../../../core/types/routeTypes';
import LoginPage from '../Pages/LoginPage';

const authRoutes: AppRoute[] = [
  {
    path: '/login',
    element: LoginPage,
    layout: 'none',
    metadata: {
      title: 'Login',
      description: 'Login page',
    },
  },

];

export default authRoutes;
