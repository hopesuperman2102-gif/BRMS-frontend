import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import JdmEditorPage from "./JdmEditorPage";
import type { EditorPropsExtended, RepositorySidebarProps } from '@/modules/JdmEditorPage/types/JdmEditorTypes';

/* ---------------- HOISTED MOCKS ---------------- */
const { mockGetProjectRules, mockExecute, mockNavigate } = vi.hoisted(() => ({
  mockGetProjectRules: vi.fn(),
  mockExecute: vi.fn(),
  mockNavigate: vi.fn(),
}));

/* ---------------- ROUTER MOCK ---------------- */
vi.mock("react-router-dom", () => ({
  useParams: () => ({
    project_key: "proj1",
    vertical_Key: "vert1",
  }),
  useNavigate: () => mockNavigate,
  useSearchParams: () => [new URLSearchParams()],
}));

/* ---------------- API MOCKS ---------------- */
vi.mock("@/modules/rules/api/rulesApi", () => ({
  rulesApi: {
    getProjectRules: mockGetProjectRules,
  },
}));

vi.mock("@/modules/JdmEditorPage/api/executionApi", () => ({
  executionApi: {
    execute: mockExecute,
  },
}));

/* ---------------- ROLE MOCK ---------------- */
vi.mock("@/modules/auth/hooks/useRole", () => ({
  useRole: () => ({
    isReviewer: false,
    isViewer: false,
  }),
}));

/* ---------------- CHILD COMPONENT MOCKS ---------------- */

// ✅ FIX: swallow async error to prevent unhandled rejection
vi.mock("@/modules/JdmEditorPage/components/Editor", () => ({
  default: (props: EditorPropsExtended) => (
    <div data-testid="editor">
      <button
        onClick={async () => {
          try {
            await props.onSimulatorRun({ nodes: [], edges: [] }, {});
          } catch {
            // swallow error to avoid unhandled rejection
          }
        }}
      >
        Run Simulation
      </button>
    </div>
  ),
}));

vi.mock("@/modules/JdmEditorPage/components/RepositorySidebar", () => ({
  default: (props: RepositorySidebarProps) => (
    <div data-testid="sidebar">
      <button
        onClick={() =>
          props.onSelectItem({
            id: "rule1",
            name: "Rule 1",
            type: "file",
          })
        }
      >
        Select Rule
      </button>

      <button onClick={() => props.onBackClick?.()}>Back</button>
    </div>
  ),
}));

vi.mock("@/core/components/RcAlertComponent", () => ({
  default: () => <div data-testid="alert" />,
}));

/* ---------------- TEST DATA ---------------- */

const mockRulesResponse = {
  project_name: "Test Project",
  rules: [
    {
      rule_key: "rule1",
      name: "Rule 1",
      directory: "folder1",
      status: "ACTIVE",
    },
    {
      rule_key: "rule2",
      name: "Rule 2",
      directory: "folder1/sub",
      status: "ACTIVE",
    },
  ],
};

/* ---------------- TESTS ---------------- */

describe("JdmEditorPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();

    mockGetProjectRules.mockResolvedValue(mockRulesResponse);
  });

  it("renders sidebar, editor and alert", async () => {
    render(<JdmEditorPage />);

    expect(await screen.findByTestId("sidebar")).toBeInTheDocument();
    expect(await screen.findByTestId("editor")).toBeInTheDocument();
    expect(await screen.findByTestId("alert")).toBeInTheDocument();
  });

  it("fetches rules on mount", async () => {
    render(<JdmEditorPage />);

    await waitFor(() => {
      expect(mockGetProjectRules).toHaveBeenCalledWith("proj1", "vert1");
    });
  });

  it("handles rule selection", async () => {
    render(<JdmEditorPage />);

    const btn = await screen.findByText("Select Rule");
    fireEvent.click(btn);

    await waitFor(() => {
      expect(sessionStorage.getItem("activeRuleId")).toBe("rule1");
      expect(sessionStorage.getItem("activeRuleName")).toBe("Rule 1");
    });

    expect(mockNavigate).toHaveBeenCalled();
  });

  it("handles back navigation", async () => {
    render(<JdmEditorPage />);

    const btn = await screen.findByText("Back");
    fireEvent.click(btn);

    expect(mockNavigate).toHaveBeenCalledWith(
      "/vertical/vert1/dashboard/hub/proj1/rules"
    );
  });

  it("runs simulator successfully", async () => {
    mockExecute.mockResolvedValue({ result: "ok" });

    render(<JdmEditorPage />);

    const btn = await screen.findByText("Run Simulation");
    fireEvent.click(btn);

    await waitFor(() => {
      expect(mockExecute).toHaveBeenCalled();
    });
  });

  it("handles simulator error", async () => {
  vi.spyOn(console, "error").mockImplementation(() => {});

  mockExecute.mockRejectedValue(new Error("fail"));

  render(<JdmEditorPage />);

  const btn = await screen.findByText("Run Simulation");
  fireEvent.click(btn);

  await waitFor(() => {
    expect(mockExecute).toHaveBeenCalled();
  });
});
});