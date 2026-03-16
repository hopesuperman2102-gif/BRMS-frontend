import { describe, it, expect, vi, beforeEach } from "vitest";
import axiosInstance from "@/api/apiClient";
import { dashboardApi } from "@/modules/dashboard/api/dashboardApi";
import type { DashboardSummary } from "@/modules/dashboard/types/dashboardEnpointsTypes";
import type { AxiosResponse } from "axios";
import { AxiosHeaders } from "axios";

// ─── Mock axios client ───────────────────────────────────

vi.mock("@/api/apiClient", () => ({
  default: {
    get: vi.fn(),
  },
}));

const mockedGet = vi.mocked(axiosInstance.get);

// ─── Test data ───────────────────────────────────────────

const mockSummary: DashboardSummary = {
  vertical_key: "banking",
  vertical_name: "Banking",
  total_active_projects: 10,
  total_rules: 50,
  active_rules: 40,
  pending_rules: 10,
  monthly_rule_creations: [],
  monthly_deployments: [],
};

const axiosResponse: AxiosResponse<DashboardSummary> = {
  data: mockSummary,
  status: 200,
  statusText: "OK",
  headers: new AxiosHeaders(),
  config: {
    headers: new AxiosHeaders(),
  },
};

// ─── Tests ───────────────────────────────────────────────

describe("dashboardApi", () => {

  beforeEach(() => {
    vi.clearAllMocks();
    dashboardApi.invalidateCache();
  });

  it("fetches dashboard summary successfully", async () => {
    mockedGet.mockResolvedValueOnce(axiosResponse);

    const result = await dashboardApi.getSummary("banking");

    expect(mockedGet).toHaveBeenCalledWith("/api/v1/dashboard/banking");
    expect(result).toEqual(mockSummary);
  });

  it("reuses inflight request for same vertical_key", async () => {
    mockedGet.mockResolvedValueOnce(axiosResponse);

    const promise1 = dashboardApi.getSummary("banking");
    const promise2 = dashboardApi.getSummary("banking");

    const [result1, result2] = await Promise.all([promise1, promise2]);

    expect(mockedGet).toHaveBeenCalledTimes(1);
    expect(result1).toEqual(mockSummary);
    expect(result2).toEqual(mockSummary);
  });

  it("clears cache after successful request", async () => {
    mockedGet.mockResolvedValueOnce(axiosResponse);

    await dashboardApi.getSummary("banking");

    mockedGet.mockResolvedValueOnce(axiosResponse);

    await dashboardApi.getSummary("banking");

    expect(mockedGet).toHaveBeenCalledTimes(2);
  });

  it("clears cache if request fails", async () => {
    mockedGet.mockRejectedValueOnce(new Error("API failed"));

    await expect(
      dashboardApi.getSummary("banking")
    ).rejects.toThrow("API failed");

    mockedGet.mockResolvedValueOnce(axiosResponse);

    const result = await dashboardApi.getSummary("banking");

    expect(result).toEqual(mockSummary);
    expect(mockedGet).toHaveBeenCalledTimes(2);
  });

  it("invalidates cache for specific vertical_key", async () => {
    mockedGet.mockResolvedValueOnce(axiosResponse);

    await dashboardApi.getSummary("banking");

    dashboardApi.invalidateCache("banking");

    mockedGet.mockResolvedValueOnce(axiosResponse);

    await dashboardApi.getSummary("banking");

    expect(mockedGet).toHaveBeenCalledTimes(2);
  });

  it("clears entire cache", async () => {
    mockedGet.mockResolvedValueOnce(axiosResponse);
    mockedGet.mockResolvedValueOnce(axiosResponse);

    await dashboardApi.getSummary("banking");
    await dashboardApi.getSummary("insurance");

    dashboardApi.invalidateCache();

    mockedGet.mockResolvedValueOnce(axiosResponse);
    mockedGet.mockResolvedValueOnce(axiosResponse);

    await dashboardApi.getSummary("banking");
    await dashboardApi.getSummary("insurance");

    expect(mockedGet).toHaveBeenCalledTimes(4);
  });

});