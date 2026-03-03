import { ENV } from '@/config/env';
import axiosInstance from '@/modules/auth/http/Axiosinstance';
import { DashboardSummary } from '@/modules/dashboard/types/dashboardEnpointsTypes';


const BASE = ENV.API_BASE_URL;

const inflightCache = new Map<string, Promise<DashboardSummary>>();

export const dashboardApi = {

  getSummary: async (vertical_key: string): Promise<DashboardSummary> => {

    if (inflightCache.has(vertical_key)) {
      return inflightCache.get(vertical_key)!;
    }

    const promise = axiosInstance
      .get<DashboardSummary>(`${BASE}/api/v1/dashboard/${vertical_key}`)
      .then((res) => {
        inflightCache.delete(vertical_key); 
        return res.data;
      })
      .catch((err) => {
        inflightCache.delete(vertical_key);
        throw err;
      });

    inflightCache.set(vertical_key, promise);
    return promise;
  },

  invalidateCache: (vertical_key?: string) => {
    if (vertical_key) {
      inflightCache.delete(vertical_key);
    } else {
      inflightCache.clear();
    }
  },
};
