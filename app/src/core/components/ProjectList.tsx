"use client";

export type Project = {
  id: string; 
  name: string;
  description?: string;
  domain?: string;
  updatedAt: string;
};

import { useState } from "react";
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
import { projectsMock } from "./mock_data";
import { projectsApi } from "app/src/api/projectsApi";

export default function ProjectListCard() {
  const [projects, setProjects] = useState<Project[]>(projectsMock);
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreateProject = async (data: { [key: string]: string }) => {
    try {
      const response = await projectsApi.createProject({
        name: data.name,
        description: data.description,
        domain: data.domain,
      });

      // Extract project from the API response
      const newProject = response.project;

      // Add the new project to the list
      const projectToAdd = {
        id: newProject.id,
        name: newProject.name,
        description: data.description,
        domain: data.domain,
        updatedAt: new Date(newProject.created_at).toLocaleString(),
      };

      setProjects((prev) => [projectToAdd, ...prev]);
    } catch (error) {
      console.error("Error creating project:", error);
      // If API fails, still add to local state for demo purposes
      const now = new Date().toLocaleString();
      const newProject = {
        id: Date.now().toString(),
        name: data.name,
        description: data.description,
        domain: data.domain,
        updatedAt: now,
      };
      setProjects((prev) => [newProject, ...prev]);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await projectsApi.deleteProject(id);

      // Remove from local state
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Error deleting project:", error);
      // If API fails, still remove from local state
      setProjects((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleOpenProject = (project: Project) => {
    router.push(`/dashboard/${project.id}/rules`);
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
          {/* Header */}{" "}
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            {" "}
            <Typography variant="h6">My projects</Typography>{" "}
            <Button variant="contained" onClick={() => setOpenModal(true)}>
              {" "}
              Create project{" "}
            </Button>{" "}
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
                    onClick={() => handleDelete(project.id)}
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
