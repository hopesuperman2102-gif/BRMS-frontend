/* eslint-disable @next/next/no-img-element */
'use client';

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { getRegisteredRoutes } from '../routeRegistry';
import PageWrapper from './PageWrapper';
import AppBarComponent from './AppBarComponent';
import type { AppRoute } from '../types/routeTypes';
import { Layout } from '../types/routeTypes';
import { CircularProgress, Box } from '@mui/material';
import { useState, useEffect } from 'react';

import '../../modules/auth/routes';
import '../../modules/hub/routes';
import '../../modules/rules/routes';
import '../../modules/JdmEditorPage/routes';
import '../../modules/vertical/routes';
import '../../modules/dashboard/routes';
import '../../modules/UserLifecycle/routes';
import { AuthProvider, useAuth } from 'app/src/modules/auth/Authcontext';
import { refreshApi } from 'app/src/modules/auth/Authservice';
import { useBindAuth } from 'app/src/modules/auth/Usebindauth';
import { getCurrentUserApi } from 'app/src/modules/auth/UserService';

function RouteWrapper({ route }: { route: AppRoute }) {
  const Element = route.element as React.ComponentType<unknown>;
  if (!Element) return null;

  if (route.layout === Layout.MAIN || route.layout === 'main') {
    return (
      <PageWrapper>
        <AppBarComponent logo={<img src="/Logo.svg" height={32} alt="logo" />} organizationName="Business Rules Management" />
        <Element />
      </PageWrapper>
    );
  }
  if (route.layout === Layout.NONE || route.layout === 'none') {
    return <PageWrapper><Element /></PageWrapper>;
  }
  return <Element />;
}

function renderRoutes(routes: AppRoute[]): React.ReactNode {
  return routes.map((route, index) => {
    const key = `${route.path}-${index}`;
    if (route.children && route.children.length > 0) {
      return (
        <Route key={key} path={route.path}>
          {route.element && <Route index element={<RouteWrapper route={route} />} />}
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
    return <Route key={key} path={route.path} element={<RouteWrapper route={route} />} />;
  });
}

function AppRouterInner() {
  const routes = getRegisteredRoutes();
  const { setAccessToken, setIsAuthenticated, isAuthenticated, setRoles } = useAuth();
  const [isReady, setIsReady] = useState(false);

  useBindAuth();

  useEffect(() => {
    async function init() {
      const path = window.location.pathname;
      if (path === '/login' || path === '/') {
        setAccessToken(null);
        setIsAuthenticated(false);
        setRoles([]);
        setIsReady(true);
        return;
      }

      const accessToken = await refreshApi();

      if (accessToken) {
        setAccessToken(accessToken);
        setIsAuthenticated(true);
        // Restore roles on refresh — fetch from API
        try {
          const user = await getCurrentUserApi();
          setRoles(user.roles ?? []);
        } catch {
          setRoles([]);
        }
      } else {
        setAccessToken(null);
        setIsAuthenticated(false);
        setRoles([]);
      }

      setIsReady(true);
    }

    init();
  }, [setAccessToken, setIsAuthenticated, setRoles]);

  if (!isReady) {
    return (
      <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? '/vertical' : '/login'} replace />}
        />
        {renderRoutes(routes)}
      </Routes>
    </BrowserRouter>
  );
}

export default function AppRouter() {
  return (
    <AuthProvider>
      <AppRouterInner />
    </AuthProvider>
  );
}