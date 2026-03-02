import { useEffect } from 'react';
import { useAuth } from '../context/Authcontext';
import { bindAuthToAxios } from '../http/Axiosinstance';

export function useBindAuth() {
  const { getAccessToken, setAccessToken } = useAuth();

  useEffect(() => {
    bindAuthToAxios(getAccessToken, setAccessToken);
  }, [getAccessToken, setAccessToken]);
}