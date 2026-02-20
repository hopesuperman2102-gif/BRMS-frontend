import { ENV } from '../../../config/env';

const BASE = ENV.API_BASE_URL;

const JSON_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
} as const;

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as { detail?: string }).detail || `HTTP ${response.status}`);
  }
  return response.json() as Promise<T>;
}

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
// Dedupes simultaneous calls only — clears itself once resolved
// Never serves stale data on re-mount/navigation

const inflightCache = new Map<string, Promise<DashboardSummary>>();

// ─── API ──────────────────────────────────────────────────────────────────────

export const dashboardApi = {

  getSummary: async (vertical_key: string): Promise<DashboardSummary> => {

    // If request already in-flight, share it — no duplicate network call
    if (inflightCache.has(vertical_key)) {
      return inflightCache.get(vertical_key)!;
    }

    // New request — cache promise immediately so simultaneous callers share it
    const promise = fetch(
      `${BASE}/api/v1/dashboard/${vertical_key}`,
      { method: 'GET', headers: JSON_HEADERS },
    )
      .then((res) => handleResponse<DashboardSummary>(res))
      .then((data) => {
        inflightCache.delete(vertical_key); // clear once resolved — next call hits API fresh
        return data;
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