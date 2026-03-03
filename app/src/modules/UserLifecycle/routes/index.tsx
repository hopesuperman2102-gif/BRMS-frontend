import type { AppRoute } from '../../../core/types/routeTypes';
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

export default UserLifeCycleRoutes;
