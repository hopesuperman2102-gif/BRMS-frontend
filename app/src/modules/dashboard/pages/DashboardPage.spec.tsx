import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import DashboardPage from "@/modules/dashboard/pages/DashboardPage";
import { dashboardApi } from "@/modules/dashboard/api/dashboardApi";
import type { DashboardSummary } from "@/modules/dashboard/types/dashboardEnpointsTypes";
import type { StatsProps } from "@/modules/dashboard/types/dashboardTypes";
import type { RulesCreatedChartProps } from "@/modules/dashboard/types/dashboardTypes";

// ─── Router mocks ─────────────────────────────────────────

const mockNavigate = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useParams: () => ({ vertical_Key: "banking" }),
}));

// ─── Component mocks ─────────────────────────────────

vi.mock("@/modules/dashboard/components/DashboardHeader", () => ({
  default: () => <div data-testid="dashboard-header" />,
}));

vi.mock("@/modules/dashboard/components/Stats", () => ({
  default: ({
    totalActiveProjects,
    totalRules,
    activeRules,
    pendingRules,
  }: StatsProps) => (
    <div data-testid="stats-section">
      {totalActiveProjects}
      {totalRules}
      {activeRules}
      {pendingRules}
    </div>
  ),
}));

vi.mock("@/core/components/RcMonthBarChart", () => ({
  default: ({ title }: RulesCreatedChartProps & { title: string }) => (
    <div data-testid="chart">{title}</div>
  ),
}));

// ─── API mock ──────────────────────────────────────────────

vi.mock("@/modules/dashboard/api/dashboardApi", () => ({
  dashboardApi: {
    getSummary: vi.fn(),
  },
}));

const mockSummary: DashboardSummary = {
  vertical_key: "banking",
  vertical_name: "Banking",
  total_active_projects: 5,
  total_rules: 20,
  active_rules: 15,
  pending_rules: 5,
  monthly_rule_creations: [],
  monthly_deployments: [],
};

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(dashboardApi.getSummary).mockResolvedValue(mockSummary);
  });

  it("calls dashboard summary API", async () => {
    render(<DashboardPage />);

    await waitFor(() => {
      expect(dashboardApi.getSummary).toHaveBeenCalledWith("banking");
    });
  });

  it("renders vertical name", async () => {
    render(<DashboardPage />);

    expect(await screen.findByText("Banking")).toBeInTheDocument();
  });

  it("renders dashboard header", async () => {
    render(<DashboardPage />);

    expect(await screen.findByTestId("dashboard-header")).toBeInTheDocument();
  });

  it("renders stats section with correct values", async () => {
    render(<DashboardPage />);

    const stats = await screen.findByTestId("stats-section");

    expect(stats).toHaveTextContent("5");
    expect(stats).toHaveTextContent("20");
    expect(stats).toHaveTextContent("15");
    expect(stats).toHaveTextContent("5");
  });

  it("renders both charts", async () => {
    render(<DashboardPage />);

    const charts = await screen.findAllByTestId("chart");

    expect(charts).toHaveLength(2);
    expect(screen.getByText("Rules Created")).toBeInTheDocument();
    expect(screen.getByText("Deployed Rules")).toBeInTheDocument();
  });

  it("navigates back when back button clicked", async () => {
    render(<DashboardPage />);

    const button = await screen.findByRole("button");

    fireEvent.click(button);

    expect(mockNavigate).toHaveBeenCalledWith("/vertical");
  });

  it("handles API error gracefully", async () => {
  const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  
  vi.mocked(dashboardApi.getSummary).mockRejectedValue(new Error("API failed"));

  render(<DashboardPage />);

  await waitFor(() => {
    expect(consoleSpy).toHaveBeenCalledWith(
      "Error fetching dashboard summary:",
      expect.any(Error)
    );
  });

  consoleSpy.mockRestore();
});
});