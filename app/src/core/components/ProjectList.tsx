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
import { useRouter } from "next/navigation";
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
import { CreateModal } from "./CreateModal";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import IconButton from "@mui/material/IconButton";
import { projectsApi } from "app/src/api/projectsApi";

export default function ProjectListCard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projectsApi.getProjectsView();

      const projectsFromApi: Project[] = response.map((p: any) => ({
        id: p.id,
        project_key: p.project_key,
        name: p.name,
        description: p.description,
        domain: p.domain,
        updatedAt: new Date(p.updated_at || p.created_at).toLocaleString(),
      }));

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

  const handleCreateOrUpdate = async (data: { [key: string]: string }) => {
    if (editProject) {
      await projectsApi.updateProject(editProject.project_key, {
        name: data.name,
        description: data.description,
        domain: data.domain,
      });

      setEditProject(null);
      fetchProjects(); // 👈 see next fix
    } else {
      const response = await projectsApi.createProject({
        name: data.name,
        description: data.description,
        domain: data.domain,
      });

      setProjects((prev) => [response.project, ...prev]);
    }
  };

  /* ---------- Menu handlers ---------- */

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    project: Project,
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
        prev.filter((p) => p.project_key !== selectedProject.project_key),
      );
      handleMenuClose();
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const handleEdit = () => {
    if (!selectedProject) return;
    setEditProject(selectedProject);
    handleMenuClose();
  };

  const handleOpenProject = (project: Project) => {
    router.push(`/dashboard/${project.project_key}/rules`);
  };

  return (
    <>
      <Card>
        <CardContent
          sx={{
            maxHeight: 500,
            overflowY: "auto",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
            msOverflowStyle: "none",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="h6">My projects</Typography>
            <Button variant="contained" onClick={() => setOpenModal(true)}>
              Create project
            </Button>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              borderBottom: 1,
              borderColor: "divider",
              pb: 1,
              mb: 1,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Name
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Actions
            </Typography>
          </Box>

          {loading ? (
            <Box sx={{ py: 4, textAlign: "center" }}>
              <CircularProgress />
            </Box>
          ) : projects.length === 0 ? (
            <Box sx={{ py: 4, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                No projects yet. Create your first project to get started.
              </Typography>
            </Box>
          ) : (
            projects.map((project) => (
              <Box
                key={project.id}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  py: 2,
                  borderBottom: 1,
                  borderColor: "divider",
                }}
              >
                <Box>
                  <Typography
                    variant="body2"
                    color="primary"
                    sx={{ cursor: "pointer", fontWeight: 500 }}
                    onClick={() => handleOpenProject(project)}
                  >
                    {project.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
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
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>Edit</MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
          Delete
        </MenuItem>
      </Menu>

      <CreateModal
        open={openModal || !!editProject}
        onClose={() => {
          setOpenModal(false);
          setEditProject(null);
        }}
        onCreate={handleCreateOrUpdate}
        title={editProject ? "Edit Project" : "Create Rule"}
        fields={[
          { name: "name", label: "Project Name" },
          { name: "description", label: "Description" },
          { name: "domain", label: "Domain" },
        ]}
      />
    </>
  );
}
