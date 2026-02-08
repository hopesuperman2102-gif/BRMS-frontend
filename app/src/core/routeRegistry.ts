import type { AppRoute } from './types/routeTypes';

// Global registry to store all registered routes
let moduleRoutes: AppRoute[] = [];

/**
 * Register routes from a module
 * This function collects routes from different modules
 */
export function registerRoutes(routes: AppRoute[]): void {
  moduleRoutes = [...moduleRoutes, ...routes];
}

/**
 * Get all registered routes
 */
export function getRegisteredRoutes(): AppRoute[] {
  return moduleRoutes;
}

/**
 * Clear all registered routes (useful for testing)
 */
export function clearRoutes(): void {
  moduleRoutes = [];
}
