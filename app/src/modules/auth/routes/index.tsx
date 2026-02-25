import type { AppRoute } from '../../../core/types/routeTypes';
import { registerRoutes } from '../../../core/routeRegistry';
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

registerRoutes(authRoutes);

export default authRoutes;
