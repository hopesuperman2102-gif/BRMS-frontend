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
import { CreateModal } from "./CreateModal";
import { projectsApi } from "app/src/api/projectsApi";

export default function ProjectListCard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [openModal, setOpenModal] = useState(false);
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

      const newProject = response.project;

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
                </Box>
              </Box>
            ))
          )}
        </CardContent>
      </Card>

      <CreateModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onCreate={handleCreateProject}
        title="Create New Project"
        fields={[
          { name: "name", label: "Project Name" },
          { name: "description", label: "Description" },
          { name: "domain", label: "Domain" },
        ]}
      />
    </>
  );
}
