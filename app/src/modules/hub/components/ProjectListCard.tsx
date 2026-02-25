"use client";

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import { projectsApi } from "app/src/modules/hub/api/projectsApi";
import { ProjectListProps } from "../types/projectListTypes";
import { brmsTheme } from "app/src/core/theme/brmsTheme";
import ProjectListLeftPanel from "./ProjectListLeftPanel";
import ProjectListRightPanel from "./ProjectListRightPanel";
import { useRole } from "app/src/modules/auth/useRole";

const { colors, fonts } = brmsTheme;

const RootWrapper = styled(Box)({
  width: "100%",
  display: "flex",
  borderRadius: "16px",
  overflow: "hidden",
  border: `1px solid ${colors.panelBorder}`,
  boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
  fontFamily: fonts.sans,
  height: "calc(100vh - 64px)",
});

export default function ProjectListCard() {
  const [projects, setProjects] = useState<ProjectListProps[]>([]);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProject, setSelectedProject] = useState<ProjectListProps | null>(null);
  const [hoveredProject, setHoveredProject] = useState<ProjectListProps | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const navigate = useNavigate();
  const { vertical_Key } = useParams();
  const { isRuleAuthor } = useRole();

  useEffect(() => {
    if (!vertical_Key) return;
    const controller = new AbortController();
    projectsApi.invalidateProjectsCache(vertical_Key);

    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await projectsApi.getVerticalProjects(vertical_Key);
        if (!controller.signal.aborted) {
          const mapped: ProjectListProps[] = response.projects.map((p) => {
            const src = p.updated_at ?? p.created_at ?? "";
            return {
              id: String(p.id),
              project_key: p.project_key,
              name: p.name,
              description: p.description,
              domain: p.domain,
              updatedAt: src ? new Date(src).toLocaleString() : "",
            };
          });
          setProjects(mapped);
        }
      } catch (error: unknown) {
        if (!controller.signal.aborted) console.error("Failed to load projects:", error);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchProjects();
    return () => controller.abort();
  }, [vertical_Key]);

  const rowsPerPage = 5;
  const totalPages = Math.ceil(projects.length / rowsPerPage);
  const paginatedProjects = projects.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const handleMenuOpen = (e: React.MouseEvent, p: ProjectListProps) => {
    setMenuAnchorEl(e.currentTarget as HTMLElement);
    setSelectedProject(p);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedProject(null);
  };

  const handleDelete = async () => {
    if (!selectedProject) return;
    try {
      await projectsApi.deleteProject(selectedProject.project_key, "admin");
      setProjects((prev) =>
        prev.filter((p) => p.project_key !== selectedProject.project_key)
      );
      handleMenuClose();
    } catch (err) {
      console.error("Error deleting project:", err);
    }
  };

  const handleEdit = () => {
    if (!selectedProject) return;
    navigate(
      `/vertical/${vertical_Key}/dashboard/hub/createproject?key=${selectedProject.project_key}`
    );
    handleMenuClose();
  };

  const handleOpenProject = (p: ProjectListProps) =>
    navigate(`/vertical/${vertical_Key}/dashboard/hub/${p.project_key}/rules`);

  const handleNewProject = () =>
    navigate(`/vertical/${vertical_Key}/dashboard/hub/createproject`);

  return (
    <RootWrapper>
      <ProjectListLeftPanel
        projects={projects}
        hoveredProject={hoveredProject}
      />

      <ProjectListRightPanel
        loading={loading}
        paginatedProjects={paginatedProjects}
        totalPages={totalPages}
        page={page}
        menuAnchorEl={menuAnchorEl}
        onPageChange={setPage}
        onOpenProject={handleOpenProject}
        onMenuOpen={handleMenuOpen}
        onMenuClose={handleMenuClose}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onNewProject={handleNewProject}
        onHoverProject={setHoveredProject}
        isRuleAuthor={isRuleAuthor}
      />
    </RootWrapper>
  );
}