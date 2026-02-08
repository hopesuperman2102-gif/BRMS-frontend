import { getRegisteredRoutes } from '../routeRegistry';
import type { AppRoute } from '../types/routeTypes';

// Import route definitions from modules
// These imports will automatically execute registerRoutes() when the modules are loaded
import '../../modules/dashboard/routes';
import '../../modules/rules/routes';
import '../../modules/JdmEditorPage/routes';

// Get all registered routes from modules
const moduleRoutes = getRegisteredRoutes();

// Core routes (if any)
const coreRoutes: AppRoute[] = [
  // Add any core-level routes here if needed
];

// Merge module and core routes into one array
const routes: AppRoute[] = [...coreRoutes, ...moduleRoutes];

export default routes;
