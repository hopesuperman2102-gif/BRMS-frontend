import type { ComponentType, ReactNode } from 'react';

export enum Layout {
  MAIN = 'main',
  AUTH = 'auth',
  NONE = 'none',
}

export type AppRoute = {
  path: string;
  element?: ComponentType<unknown> | ReactNode;
  layout?: Layout | string;
  children?: AppRoute[];
  metadata?: {
    title?: string;
    description?: string;
  };
};
