import type { AppRoute } from '../../../core/types/routeTypes';
import { registerRoutes } from '../../../core/routeRegistry';
import LoginPage from '../Pages/LoginPage';
import CreateUserPage from '../Pages/CreateUserPage';

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
  {
    path: '/signup',
    element: CreateUserPage,
    layout: 'none',
    metadata: {
      title: 'Sign Up',
      description: 'Sign up page',
    },
  },

];

registerRoutes(authRoutes);

export default authRoutes;
