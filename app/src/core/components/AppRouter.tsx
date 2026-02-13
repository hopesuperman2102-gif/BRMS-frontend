/* eslint-disable @next/next/no-img-element */
'use client';

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { getRegisteredRoutes } from '../routeRegistry';
import PageWrapper from './PageWrapper';
import AppBarComponent from './AppBarComponent';
import type { AppRoute } from '../types/routeTypes';
import { Layout } from '../types/routeTypes';

// Import route definitions from modules
import '../../modules/auth/routes';
import '../../modules/hub/routes';
import '../../modules/rules/routes';
import '../../modules/JdmEditorPage/routes';
import '../../modules/vertical/routes';
import '../../modules/dashboard/routes';

function RouteWrapper({ route }: { route: AppRoute }) {
  const Element = route.element as React.ComponentType<unknown>;
  
  if (!Element) {
    return null;
  }

  // Apply layout if specified
  if (route.layout === Layout.MAIN || route.layout === 'main') {
    return (
      <PageWrapper>
        <AppBarComponent
          logo={<img src="/Logo.svg" height={32} alt="logo" />}
          organizationName="Business Rules Management"
        />
        <Element />
      </PageWrapper>
    );
  }

  // For 'none' layout or no layout, render without AppBar
  // Still use PageWrapper for consistent styling if needed
  if (route.layout === Layout.NONE || route.layout === 'none') {
    return (
      <PageWrapper>
        <Element />
      </PageWrapper>
    );
  }

  return <Element />;
}

function renderRoutes(routes: AppRoute[]): React.ReactNode {
  return routes.map((route, index) => {
    const key = `${route.path}-${index}`;
    
    if (route.children && route.children.length > 0) {
      return (
        <Route key={key} path={route.path}>
          {route.element && (
            <Route index element={<RouteWrapper route={route} />} />
          )}
          {route.children.map((childRoute, childIndex) => (
            <Route
              key={`${childRoute.path}-${childIndex}`}
              path={childRoute.path}
              element={<RouteWrapper route={childRoute} />}
            />
          ))}
        </Route>
      );
    }

    return (
      <Route
        key={key}
        path={route.path}
        element={<RouteWrapper route={route} />}
      />
    );
  });
}

export default function AppRouter() {
  const routes = getRegisteredRoutes();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/vertical" replace />} />
        {renderRoutes(routes)}
      </Routes>
    </BrowserRouter>
  );
}
