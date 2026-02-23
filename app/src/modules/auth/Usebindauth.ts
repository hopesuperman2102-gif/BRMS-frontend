import { useEffect } from 'react';
import { bindAuthToAxios } from './Axiosinstance';
import { useAuth } from './Authcontext';


/**
 * useBindAuth
 * Connects React AuthContext (access token getter/setter) to axiosInstance
 * so the interceptor can read and update the token from React state.
 * Call this once at the top of the app.
 */
export function useBindAuth() {
  const { getAccessToken, setAccessToken } = useAuth();

  useEffect(() => {
    bindAuthToAxios(getAccessToken, setAccessToken);
  }, [getAccessToken, setAccessToken]);
}