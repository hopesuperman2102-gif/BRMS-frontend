import React, { createContext, useContext, useRef, useState, useCallback } from 'react';
import { AuthContextType } from '@/modules/auth/types/authTypes';

const AuthContext = createContext<AuthContextType | null>(null);
const ACCESS_TOKEN_KEY = 'brms_access_token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialToken =
    typeof window !== 'undefined' ? window.sessionStorage.getItem(ACCESS_TOKEN_KEY) : null;
  const accessTokenRef = useRef<string | null>(initialToken);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [roles, setRoles] = useState<string[]>([]);

  const getAccessToken = useCallback(() => accessTokenRef.current, []);

  const setAccessToken = useCallback((token: string | null) => {
    accessTokenRef.current = token;
    if (typeof window !== 'undefined') {
      if (token) window.sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
      else window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ getAccessToken, setAccessToken, isAuthenticated, setIsAuthenticated, roles, setRoles }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
