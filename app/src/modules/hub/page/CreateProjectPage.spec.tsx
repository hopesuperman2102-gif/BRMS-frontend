import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import CreateProjectPage from "./CreateProjectPage";

/* ─── Mocks ───────────────────────────────────────────── */
// router
const mockNavigate = vi.fn();
let mockParams: any = { vertical_Key: "v1" };
let mockSearchParams = new URLSearchParams();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useParams: () => mockParams,
  useSearchParams: () => [mockSearchParams],
}));

// role
let mockRole = {
  isRuleAuthor: false,
  isReviewer: false,
  isViewer: false,
};

vi.mock("@/modules/auth/hooks/useRole", () => ({
  useRole: () => mockRole,
}));

// API
const mockGetProjects = vi.fn();
const mockCreateProject = vi.fn();
const mockUpdateProject = vi.fn();

vi.mock("@/modules/hub/api/projectsApi", () => ({
  projectsApi: {
    getProjectsView: (...args: any) => mockGetProjects(...args),
    createProject: (...args: any) => mockCreateProject(...args),
    updateProject: (...args: any) => mockUpdateProject(...args),
  },
}));

vi.mock("@/modules/hub/components/CreateProjectLeftPanel", () => ({
  default: ({ onBack }: any) => <button onClick={onBack}>Back</button>,
}));

vi.mock("@/modules/hub/components/CreateProjectRightPanel", () => ({
  default: (props: any) => (
    <div>
      <button onClick={props.onSubmit}>Submit</button>
      <button onClick={props.onCancel}>Cancel</button>
      <button onClick={props.onBack}>Back</button>
      <input
        data-testid="name"
        value={props.form.name}
        onChange={(e) => props.onFieldChange("name", e.target.value)}
      />
      <textarea
        data-testid="description"
        value={props.form.description}
        onChange={(e) => props.onFieldChange("description", e.target.value)}
      />
      {props.error && <p>{props.error}</p>}
    </div>
  ),
}));

/* ─── Helper ───────────────────────────────────────────── */

const renderComponent = () => render(<CreateProjectPage />);

/* ─── Tests ───────────────────────────────────────────── */

describe("CreateProjectPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
    mockRole = {
      isRuleAuthor: false,
      isReviewer: false,
      isViewer: false,
    };
  });

  /* ─── Create Mode ───────────────── */

  it("renders in create mode", () => {
    renderComponent();
    expect(screen.getByText("Submit")).toBeInTheDocument();
  });

  it("creates project successfully", async () => {
    mockGetProjects.mockResolvedValue([]);
    mockCreateProject.mockResolvedValue({});
    renderComponent();
    fireEvent.change(screen.getByTestId("name"), {
      target: { value: "New Project" },
    });
    fireEvent.click(screen.getByText("Submit"));
    await waitFor(() => {
      expect(mockCreateProject).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith("/vertical/v1/dashboard/hub");
    });
  });

  it("shows error if name is empty", async () => {
    renderComponent();
    fireEvent.click(screen.getByText("Submit"));
    expect(
      await screen.findByText("Project name is required"),
    ).toBeInTheDocument();
  });

  it("shows error if description exceeds limit", async () => {
    renderComponent();
    fireEvent.change(screen.getByTestId("name"), {
      target: { value: "Test" },
    });
    fireEvent.change(screen.getByTestId("description"), {
      target: { value: "a".repeat(301) },
    });
    fireEvent.click(screen.getByText("Submit"));
    expect(
      await screen.findByText("Description cannot exceed 300 characters"),
    ).toBeInTheDocument();
  });

  it("handles duplicate project name", async () => {
    mockGetProjects.mockResolvedValue([{ name: "Test", project_key: "1" }]);
    renderComponent();
    fireEvent.change(screen.getByTestId("name"), {target: { value: "Test" },});
    fireEvent.click(screen.getByText("Submit"));
    expect(
      await screen.findByText("A project with this name already exists."),
    ).toBeInTheDocument();
  });

  /* ─── Edit Mode ───────────────── */

  it("loads existing project in edit mode", async () => {
    mockSearchParams = new URLSearchParams({ key: "p1" });
    mockGetProjects.mockResolvedValue([
      {
        project_key: "p1",
        name: "Existing",
        description: "Desc",
        domain: "finance",
      },
    ]);
    renderComponent();
    await waitFor(() => {
      expect(mockGetProjects).toHaveBeenCalled();
    });
  });

  it("updates project in edit mode", async () => {
    mockSearchParams = new URLSearchParams({ key: "p1" });
    mockGetProjects.mockResolvedValue([{ project_key: "p1", name: "Old" }]);
    mockUpdateProject.mockResolvedValue({});
    renderComponent();
    fireEvent.change(screen.getByTestId("name"), {
      target: { value: "Updated" },
    });
    fireEvent.click(screen.getByText("Submit"));
    await waitFor(() => {
      expect(mockUpdateProject).toHaveBeenCalled();
    });
  });

  it("handles project not found", async () => {
    mockSearchParams = new URLSearchParams({ key: "p1" });
    mockGetProjects.mockResolvedValue([]);
    renderComponent();
    expect(await screen.findByText("Project not found")).toBeInTheDocument();
  });

  it("handles fetch error", async () => {
    mockSearchParams = new URLSearchParams({ key: "p1" });
    mockGetProjects.mockRejectedValue(new Error());
    renderComponent();
    expect(
      await screen.findByText("Failed to load project"),
    ).toBeInTheDocument();
  });

  /* ─── Permissions ───────────────── */

  it("blocks submit if user has no permission", async () => {
    mockRole = {
      isRuleAuthor: true,
      isReviewer: false,
      isViewer: false,
    };
    renderComponent();
    fireEvent.click(screen.getByText("Submit"));
    expect(
      await screen.findByText(
        "You do not have permission to create or edit projects",
      ),
    ).toBeInTheDocument();
  });

  /* ─── Navigation ───────────────── */

  it("navigates on cancel/back", () => {
    renderComponent();
    fireEvent.click(screen.getByText("Cancel"));
    expect(mockNavigate).toHaveBeenCalledWith("/vertical/v1/dashboard/hub");
  });

  /* ─── API Error Handling ───────────────── */

  it("handles submit API failure", async () => {
    mockGetProjects.mockResolvedValue([]);
    mockCreateProject.mockRejectedValue(new Error("API error"));
    renderComponent();
    fireEvent.change(screen.getByTestId("name"), {
      target: { value: "Test" },
    });
    fireEvent.click(screen.getByText("Submit"));
    expect(await screen.findByText("API error")).toBeInTheDocument();
  });

  it("handles non-Error exception during submit", async () => {
    mockGetProjects.mockResolvedValue([]);
    mockCreateProject.mockRejectedValue("some random failure"); // NOT an Error object
    renderComponent();
    fireEvent.change(screen.getByTestId("name"), {
      target: { value: "Test Project" },
    });
    fireEvent.click(screen.getByText("Submit"));
    expect(await screen.findByText("Something went wrong")).toBeInTheDocument();
  });

  it('handles projectKey present but project not found (clean path)', async () => {
  mockSearchParams = new URLSearchParams({ key: 'missing-id' });
  mockGetProjects.mockResolvedValue([
    { project_key: 'other-id', name: 'Other Project' },
  ]);
  renderComponent();
  expect(await screen.findByText('Project not found')).toBeInTheDocument();
});
});
