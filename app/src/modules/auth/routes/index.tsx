import type { AppRoute } from '../../../core/types/routeTypes';
import { registerRoutes } from '../../../core/routeRegistry';
import LoginPage from '../components/LoginPage';
import SignupPage from '../components/SignupPage';
import VerticalSelectionPage from '../../vertical/components/VerticalSelctionComponent';

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
    element: SignupPage,
    layout: 'none',
    metadata: {
      title: 'Sign Up',
      description: 'Sign up page',
    },
  },

];

registerRoutes(authRoutes);

export default authRoutes;
