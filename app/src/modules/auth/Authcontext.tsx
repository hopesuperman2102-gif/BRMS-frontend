import React, { createContext, useContext, useRef, useState, useCallback } from 'react';

/**
 * AuthContext
 *
 * access_token → React useRef (memory only, never touches disk or sessionStorage)
 * refresh_token → httpOnly cookie (set by backend, JS cannot read it, browser sends automatically)
 */

interface AuthContextType {
  getAccessToken: () => string | null;
  setAccessToken: (token: string | null) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // access_token stored in useRef — lives in memory, never written to disk
  const accessTokenRef = useRef<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const getAccessToken = useCallback(() => accessTokenRef.current, []);

  const setAccessToken = useCallback((token: string | null) => {
    accessTokenRef.current = token;
  }, []);

  return (
    <AuthContext.Provider value={{ getAccessToken, setAccessToken, isAuthenticated, setIsAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}