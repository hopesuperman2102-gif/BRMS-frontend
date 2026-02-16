import axios from "axios";

const BASE_URL = "http://localhost:8000/api/v1";

export interface MonthlyData {
  year: number;
  month: number;
  total: number;
}

export interface DashboardSummary {
  total_active_projects: number;
  total_rules: number;
  active_rules: number;
  pending_rules: number;
  monthly_rule_creations: MonthlyData[];
  monthly_deployments: MonthlyData[];
}

export const dashboardApi = {
  async getSummary(): Promise<DashboardSummary> {
    const response = await axios.get(`${BASE_URL}/dashboard/summary`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  },
};
