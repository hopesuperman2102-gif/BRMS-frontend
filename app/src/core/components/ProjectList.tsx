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
  IconButton,
  CircularProgress,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { CreateModal } from "./CreateModal";
import { projectsApi } from "app/src/api/projectsApi";

export default function ProjectListCard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const openMenu = Boolean(menuAnchorEl);

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
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
          updatedAt: new Date(
            p.updated_at || p.created_at
          ).toLocaleString(),
        }));

        setProjects(projectsFromApi);
      } catch (error) {
        console.error("Failed to load projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleCreateProject = async (data: { [key: string]: string }) => {
    try {
      const response = await projectsApi.createProject({
        name: data.name,
        description: data.description,
        domain: data.domain,
      });

      // Extract projects from the API response
      const newProject = response.project;

      // Adds the new project to the list
      const projectToAdd: Project = {
        id: newProject.id,
        project_key: newProject.project_key,
        name: newProject.name,
        description: data.description,
        domain: data.domain,
        updatedAt: new Date(newProject.created_at).toLocaleString(),
      };

      setProjects((prev) => [projectToAdd, ...prev]);
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

   const handleDelete = async (projectKey: string) => {
    try {
      await projectsApi.deleteProject(projectKey);

      setProjects((prev) =>
        prev.filter((p) => p.project_key !== projectKey)
      );
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const handleUpdateProject = async (data: { [key: string]: string }) => {
  if (!editProject) return;

  await projectsApi.updateProject(editProject.project_key, {
    name: data.name,
    description: data.description,
    domain: data.domain,
  });

  // To update UI after successfull update
  setProjects((prev) =>
    prev.map((p) =>
      p.project_key === editProject.project_key
        ? {
            ...p,
            name: data.name,
            description: data.description,
            domain: data.domain,
            updatedAt: new Date().toLocaleString(),
          }
        : p
    )
  );
};

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

          {/* Table Header */}
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

          {/* Project List */}
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

                <Box>
                  <Button
                    size="small"
                    startIcon={<OpenInNewIcon />}
                    onClick={() => handleOpenProject(project)}
                  >
                    Open
                  </Button>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(project.project_key)}
                  >
                    <DeleteOutlineIcon />
                  </IconButton>
                  <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, project)}
                    >
                      <MoreHorizIcon />
                    </IconButton>
                </Box>
              </Box>
            ))
          )}
        </CardContent>
      </Card>
      <Menu anchorEl={menuAnchorEl} open={openMenu} onClose={handleMenuClose}>
        <MenuItem
  onClick={() => {
    setEditProject(selectedProject);
    setIsEditMode(true);
    setOpenModal(true);
    handleMenuClose();
  }}
>
  Edit
</MenuItem>
      </Menu>

      <CreateModal
  open={openModal}
  onClose={() => {
    setOpenModal(false);
    setIsEditMode(false);
    setEditProject(null);
  }}
  onCreate={isEditMode ? handleUpdateProject : handleCreateProject}
  title={isEditMode ? "Edit Project" : "Create Project"}
  submitLabel={isEditMode ? "Save" : "Create"}
  fields={[
    { name: "name", label: "Project Name" },
    { name: "description", label: "Description" },
    { name: "domain", label: "Domain" },
  ]}
  initialValues={
    isEditMode && editProject
      ? {
          name: editProject.name,
          description: editProject.description ?? "",
          domain: editProject.domain ?? "",
        }
      : {}
  }
/>
    </>
  );
}
 