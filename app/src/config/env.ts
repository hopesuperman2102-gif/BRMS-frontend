// src/config/env.ts

export const ENV = {
    // Environment
    NODE_ENV: process.env.NODE_ENV,
    IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
    IS_PRODUCTION: process.env.NODE_ENV === 'production',
    
    // API Configuration
    // In Next.js, client-side env vars must be prefixed with NEXT_PUBLIC_
    // Use env value if set, otherwise fall back to a safe default
    API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000',
    
    // Feature Flags
    DEBUG_MODE: process.env.NEXT_PUBLIC_DEBUG_MODE === 'true',
    ENABLE_LOGGING: process.env.NEXT_PUBLIC_ENABLE_LOGGING === 'true',
    
    // App Info
    APP_VERSION: process.env.NEXT_PUBLIC_VERSION || '1.0.0',
    // This is also set via scripts using NEXT_PUBLIC_ENV
    ENVIRONMENT: process.env.NEXT_PUBLIC_ENV || 'development',
  } as const;
  
  // Type-safe access
  export type EnvConfig = typeof ENV;
  
  // Helper function
  export const isDevelopment = () => ENV.IS_DEVELOPMENT;
  export const isProduction = () => ENV.IS_PRODUCTION;
  
  // Debug helper
  if (ENV.DEBUG_MODE) {
    console.log('🔧 Environment Config:', ENV);
  }