import { ENV } from '../../../config/env';
import axiosInstance from '../../auth/Axiosinstance';

const BASE = ENV.API_BASE_URL;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MonthlyData {
  year: number;
  month: number;
  total: number;
}

export interface DashboardSummary {
  vertical_key: string;
  vertical_name: string;
  total_active_projects: number;
  total_rules: number;
  active_rules: number;
  pending_rules: number;
  monthly_rule_creations: MonthlyData[];
  monthly_deployments: MonthlyData[];
}

// ─── Inflight-only cache ──────────────────────────────────────────────────────
// Dedupes simultaneous calls only — clears once resolved, never serves stale data

const inflightCache = new Map<string, Promise<DashboardSummary>>();

// ─── API ──────────────────────────────────────────────────────────────────────

export const dashboardApi = {

  getSummary: async (vertical_key: string): Promise<DashboardSummary> => {

    // If request already in-flight, share it — no duplicate network call
    if (inflightCache.has(vertical_key)) {
      return inflightCache.get(vertical_key)!;
    }

    // New request — cache promise immediately so simultaneous callers share it
    const promise = axiosInstance
      .get<DashboardSummary>(`${BASE}/api/v1/dashboard/${vertical_key}`)
      .then((res) => {
        inflightCache.delete(vertical_key); // clear once resolved
        return res.data;
      })
      .catch((err) => {
        inflightCache.delete(vertical_key); // clear on error too
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