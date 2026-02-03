"use client";

export type Project = {
  id: number;
  name: string;
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
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { CreateModal } from "./CreateModal";
import { projectsMock } from "./mock_data";
import SectionHeader from "./SectionHeader";

export default function ProjectListCard() {
  const [projects, setProjects] = useState<Project[]>(projectsMock);
  const [openModal, setOpenModal] = useState(false);
  const router = useRouter();

  const handleCreateProject = (name: string) => {
    const now = new Date().toLocaleString();
    setProjects((prev) => [
      {
        id: Date.now(),
        name,
        updatedAt: now,
      },
      ...prev,
    ]);
  };

  const handleDelete = (id: number) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
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
          <SectionHeader
            left={<Typography variant="h6">My Projects</Typography>}
            right={
              <Button variant="contained" onClick={() => setOpenModal(true)}>
                Create project
              </Button>
            }
          />

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
          {projects.length === 0 ? (
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
      />
    </>
  );
}