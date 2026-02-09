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
import { CreateModal } from "./CreateModal";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import IconButton from "@mui/material/IconButton";
import { projectsApi } from "app/src/api/projectsApi";
import { brmsTheme } from '../theme/brmsTheme';

export default function ProjectListCard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

  const handleCreateOrUpdate = async (
    data: { [key: string]: string }
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      if (editProject) {
        // When editing: check if name exists in OTHER projects (not the current one)
        const allProjects = await projectsApi.getProjectsView();
        const nameExistsInOtherProject = allProjects.some(
          (p: any) => 
            p.project_key !== editProject.project_key && 
            p.name.toLowerCase().trim() === data.name.toLowerCase().trim()
        );

        if (nameExistsInOtherProject) {
          return { 
            success: false, 
            error: "Project name already exists. Please use a different name." 
          };
        }

        // Update existing project
        await projectsApi.updateProject(editProject.project_key, {
          name: data.name,
          description: data.description,
          domain: data.domain,
        });

        setEditProject(null);
        await fetchProjects();
        return { success: true };
      } else {
        // When creating: check if name exists in ANY project
        const nameExists = await projectsApi.checkProjectNameExists(data.name);

        if (nameExists) {
          return { 
            success: false, 
            error: "Project name already exists. Please use a different name." 
          };
        }

        // Create new project
        await projectsApi.createProject({
          name: data.name,
          description: data.description,
          domain: data.domain,
        });

        await fetchProjects();
        return { success: true };
      }
    } catch (error: any) {
      console.error("Error in handleCreateOrUpdate:", error);
      return { 
        success: false, 
        error: error.message || "An error occurred" 
      };
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
    } catch (error: any) {
      console.error("Error deleting project:", error);
    }
  };

  const handleEdit = () => {
    if (!selectedProject) return;
    setEditProject(selectedProject);
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
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
        }}
      >
        <CardContent
          sx={{
            p: 3,
            maxHeight: 500,
            overflowY: "auto",
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: brmsTheme.scrollbars.thumb,
              borderRadius: '3px',
              '&:hover': {
                background: brmsTheme.scrollbars.thumbHover,
              },
            },
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
            <Typography 
              variant="h6"
              sx={{
                fontWeight: 700,
                background: brmsTheme.gradients.primary,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              My projects
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => setOpenModal(true)}
              sx={{
                background: brmsTheme.gradients.primary,
                boxShadow: brmsTheme.shadows.primarySoft,
                borderRadius: 2,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                transition: 'all 0.2s ease',
                '&:hover': {
                  boxShadow: brmsTheme.shadows.primaryHover,
                  background: brmsTheme.gradients.primaryHover,
                  transform: 'translateY(-1px)',
                },
              }}
            >
              Create project
            </Button>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              borderBottom: '2px solid rgba(101, 82, 208, 0.1)',
              pb: 1.5,
              mb: 2,
            }}
          >
            <Typography 
              variant="body2" 
              sx={{
                color: 'text.secondary',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Name
            </Typography>
            <Typography 
              variant="body2" 
              sx={{
                color: 'text.secondary',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
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
                  px: 1,
                  borderBottom: '1px solid rgba(101, 82, 208, 0.1)',
                  borderRadius: 2,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: 'rgba(101, 82, 208, 0.05)',
                    transform: 'translateX(4px)',
                  },
                }}
              >
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ 
                      cursor: "pointer", 
                      fontWeight: 600,
                      color: '#6552D0',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        color: '#5443B8',
                      },
                    }}
                    onClick={() => handleOpenProject(project)}
                  >
                    {project.name}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: 'text.secondary',
                      fontSize: '0.75rem',
                    }}
                  >
                    Last updated {project.updatedAt}
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  onClick={(e) => handleMenuOpen(e, project)}
                  sx={{
                    '&:hover': {
                      bgcolor: 'rgba(101, 82, 208, 0.1)',
                    },
                  }}
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
        title={editProject ? "Edit Project" : "Create Project"}
        fields={[
          { name: "name", label: "Project Name", required: true },
          { name: "description", label: "Description"},
          { name: "domain", label: "Domain"},
        ]}
      />
    </>
  );
}