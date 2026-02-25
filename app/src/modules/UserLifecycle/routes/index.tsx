import type { AppRoute } from '../../../core/types/routeTypes';
import { registerRoutes } from '../../../core/routeRegistry';
import CreateUserPage from '../../UserLifecycle/pages/CreateUserPage';

const UserLifeCycleRoutes: AppRoute[] = [
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

registerRoutes(UserLifeCycleRoutes);

export default UserLifeCycleRoutes;
