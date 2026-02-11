"use client";

export type Project = {
  id: string;
  project_key: string;
  name: string;
  description?: string;
  domain?: string;
  updatedAt: string;
};

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  Box,
  Typography,
  Button,
  CircularProgress,
  Menu,
  MenuItem,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import IconButton from "@mui/material/IconButton";
import { projectsApi } from "app/src/api/projectsApi";
import { brmsTheme } from "../../../core/theme/brmsTheme";

export default function ProjectListCard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  /* ---------- Fetch projects ---------- */
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projectsApi.getProjectsView();

      const projectsFromApi: Project[] = response.map((p) => {
        const updatedAtSource =
          (p.updated_at as string | number | Date | undefined) ??
          (p.created_at as string | number | Date | undefined) ??
          "";

        const updatedAt =
          updatedAtSource !== ""
            ? new Date(updatedAtSource).toLocaleString()
            : "";

        return {
          id: String(p.id),
          project_key: p.project_key,
          name: p.name,
          description: p.description,
          domain: p.domain,
          updatedAt,
        };
      });

      setProjects(projectsFromApi);
    } catch (error) {
      console.error("Failed to load projects:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  /* ---------- Menu handlers ---------- */
  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    project: Project
  ) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedProject(project);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedProject(null);
  };

  const handleDelete = async () => {
    if (!selectedProject) return;

    try {
      await projectsApi.deleteProject(selectedProject.project_key);
      setProjects((prev) =>
        prev.filter((p) => p.project_key !== selectedProject.project_key)
      );
      handleMenuClose();
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const handleEdit = () => {
    if (!selectedProject) return;

    navigate(`/dashboard/createproject?key=${selectedProject.project_key}`);
    handleMenuClose();
  };


  const handleOpenProject = (project: Project) => {
    navigate(`/dashboard/${project.project_key}/rules`);
  };

  return (
    <>
      <Card
        elevation={2}
        sx={{
          borderRadius: 4,
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
        }}
      >
        <CardContent
          sx={{
            p: 3,
            maxHeight: 500,
            overflowY: "auto",
            "&::-webkit-scrollbar": { width: "6px" },
            "&::-webkit-scrollbar-thumb": {
              background: brmsTheme.scrollbars.thumb,
              borderRadius: "3px",
            },
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              My projects
            </Typography>

            <Button
              variant="contained"
              onClick={() => navigate("/dashboard/createproject")}
              sx={{
                background: brmsTheme.gradients.primary,
                boxShadow: brmsTheme.shadows.primarySoft,
              }}
            >
              Create project
            </Button>
          </Box>

          {loading ? (
            <Box textAlign="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            projects.map((project) => (
              <Box
                key={project.id}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  py: 2,
                  borderBottom: "1px solid rgba(0,0,0,0.05)",
                }}
              >
                <Box>
                  <Typography
                    sx={{ cursor: "pointer" }}
                    onClick={() => handleOpenProject(project)}
                  >
                    {project.name}
                  </Typography>
                  <Typography variant="caption">
                    Last updated {project.updatedAt}
                  </Typography>
                </Box>

                <IconButton
                  size="small"
                  onClick={(e) => handleMenuOpen(e, project)}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Box>
            ))
          )}
        </CardContent>
      </Card>

      <Menu anchorEl={menuAnchorEl} open={!!menuAnchorEl} onClose={handleMenuClose}>
        <MenuItem onClick={handleEdit}>Edit</MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
          Delete
        </MenuItem>
      </Menu>
    </>
  );
}
