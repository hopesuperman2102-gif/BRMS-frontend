import { useEffect } from 'react';
import { useAuth } from '@/modules/auth/context/Authcontext';
import { bindAuthToAxios } from '@/api/apiClient';

export function useBindAuth() {
  const { getAccessToken, setAccessToken } = useAuth();

  useEffect(() => {
    bindAuthToAxios(getAccessToken, setAccessToken);
  }, [getAccessToken, setAccessToken]);
}
