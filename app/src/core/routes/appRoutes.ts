import type { AppRoute } from '@/core/types/routeTypes';
import authRoutes from '@/modules/auth/routes';
import hubRoutes from '@/modules/hub/routes';
import rulesRoutes from '@/modules/rules/routes';
import jdmEditorRoutes from '@/modules/JdmEditorPage/routes';
import verticalRoutes from '@/modules/vertical/routes';
import dashboardRoutes from '@/modules/dashboard/routes';
import userLifecycleRoutes from '@/modules/UserLifecycle/routes';

export const appRoutes: AppRoute[] = [
  ...authRoutes,
  ...hubRoutes,
  ...rulesRoutes,
  ...jdmEditorRoutes,
  ...verticalRoutes,
  ...dashboardRoutes,
  ...userLifecycleRoutes,
];

export default appRoutes;
