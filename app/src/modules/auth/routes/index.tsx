import type { AppRoute } from '../../../core/types/routeTypes';
import { registerRoutes } from '../../../core/routeRegistry';
import LoginPage from '../components/LoginPage';
import SignupPage from '../components/SignupPage';
import FeatureFlagsCardsPage from '../../dashboard/components/VerticalSelctionPage';

const authRoutes: AppRoute[] = [
  {
    path: '/login',
    element: FeatureFlagsCardsPage,
    layout: 'main',
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
