import { useEffect, useState } from 'react';
import { refreshApi } from './Authservice';


export function useAuthInit() {
  const [isReady, setIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      // Browser automatically sends httpOnly cookie — no manual token reading needed
      const accessToken = await refreshApi();

      if (!cancelled) {
        setIsAuthenticated(!!accessToken);
        setIsReady(true);
      }
    }

    init();
    return () => { cancelled = true; };
  }, []);

  return { isReady, isAuthenticated };
}