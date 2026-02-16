"use client";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  Box,
  Typography,
  Button,
  CircularProgress,
  Menu,
  MenuItem,
  Pagination,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import IconButton from "@mui/material/IconButton";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import { projectsApi } from "app/src/modules/hub/api/projectsApi";
import { brmsTheme } from "../../../core/theme/brmsTheme";
import AccountTree from "@mui/icons-material/AccountTree";

export type Project = {
  id: string;
  project_key: string;
  name: string;
  description?: string;
  domain?: string;
  updatedAt: string;
};

export default function ProjectListCard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const navigate = useNavigate();
  const { vertical_Key } = useParams();

  /* ---------- Fetch projects ---------- */
  const fetchProjects = async (vertical_key: string) => {
    try {
      setLoading(true);
      const response = await projectsApi.getProjectsView(vertical_key);

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
    fetchProjects(vertical_Key!);
  }, [vertical_Key]);

  const rowsPerPage = 5;
  const totalPages = Math.ceil(projects.length / rowsPerPage);

  const paginatedProjects = projects.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

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
      await projectsApi.deleteProject(selectedProject.project_key, "admin");
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

    navigate(`/vertical/${vertical_Key}/dashboard/hub/createproject?key=${selectedProject.project_key}`);
    handleMenuClose();
  };

  const handleOpenProject = (project: Project) => {
    navigate(`/vertical/${vertical_Key}/dashboard/hub/${project.project_key}/rules`);
  };

  return (
    <>
      <Card
        elevation={0}
        sx={{
          borderRadius: '16px',
          backgroundColor: '#ffffff',
          border: '1px solid #E5E7EB',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
        }}
      >
        <CardContent sx={{ p: 2 }}>
          {/* Header */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: 'center', mb: 2 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.25 }}>
                <AccountTree sx={{ fontSize: 20, color: '#6552D0', flexShrink: 0 }} />
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: '#6552D0',
                    letterSpacing: '-0.01em',
                    fontSize: '1.125rem',
                  }}
                >
                  Projects
                </Typography>
              </Box>
              <Typography
                variant="body2"
                sx={{
                  color: '#6B7280',
                  fontSize: '0.8125rem',
                }}
              >
                Manage and organize your projects
              </Typography>
            </Box>

            <Button
              variant="contained"
              onClick={() => navigate(`/vertical/${vertical_Key}/dashboard/hub/createproject`)}
              sx={{
                background: brmsTheme.gradients.primary,
                borderRadius: '8px',
                px: 2,
                py: 0.75,
                textTransform: 'none',
                fontSize: '0.875rem',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(101, 82, 208, 0.25)',
                '&:hover': {
                  background: brmsTheme.gradients.primaryHover,
                  boxShadow: '0 6px 16px rgba(101, 82, 208, 0.35)',
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.2s',
              }}
            >
              + Create Project
            </Button>
          </Box>

          {loading ? (
            <Box textAlign="center" py={4}>
              <CircularProgress sx={{ color: brmsTheme.colors.primary }} />
            </Box>
          ) : paginatedProjects.length === 0 ? (
            <Box
              sx={{
                textAlign: 'center',
                py: 4,
                px: 2,
              }}
            >
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  backgroundColor: '#F3F4F6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  mb: 1.5,
                }}
              >
                <FolderOpenIcon sx={{ fontSize: 28, color: '#9CA3AF' }} />
              </Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: '#374151',
                  mb: 0.5,
                  fontSize: '0.9375rem',
                }}
              >
                No projects yet
              </Typography>
              <Typography
                sx={{
                  color: '#6B7280',
                  fontSize: '0.8125rem',
                }}
              >
                Get started by creating your first project
              </Typography>
            </Box>
          ) : (
            <>
              {/* Project Cards */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {paginatedProjects.map((project) => (
                  <Box
                    key={project.id}
                    sx={{
                      borderRadius: '10px',
                      border: '1px solid #E5E7EB',
                      backgroundColor: '#FAFAFA',
                      p: 2,
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                      '&:hover': {
                        borderColor: brmsTheme.colors.primary,
                        backgroundColor: '#ffffff',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 16px rgba(101, 82, 208, 0.1)',
                      },
                    }}
                    onClick={() => handleOpenProject(project)}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1 }}>
                        {/* Project Name */}
                        <Box sx={{ mb: 0.75 }}>
                          <Typography
                            sx={{
                              fontWeight: 600,
                              color: '#111827',
                              fontSize: '0.9375rem',
                            }}
                          >
                            {project.name}
                          </Typography>
                        </Box>

                        {/* Footer Info */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Typography
                              sx={{
                                color: '#9CA3AF',
                                fontSize: '0.75rem',
                              }}
                            >
                              Last updated
                            </Typography>
                            <Typography
                              sx={{
                                color: '#6B7280',
                                fontSize: '0.75rem',
                                fontWeight: 500,
                              }}
                            >
                              {project.updatedAt}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      {/* Menu Button */}
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMenuOpen(e, project);
                        }}
                        sx={{
                          ml: 1.5,
                          width: 32,
                          height: 32,
                          borderRadius: '6px',
                          backgroundColor: 'transparent',
                          '&:hover': {
                            backgroundColor: '#F3F4F6',
                          },
                        }}
                      >
                        <MoreVertIcon sx={{ fontSize: 18, color: '#6B7280' }} />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
              </Box>

              {/* Pagination */}
              {totalPages > 1 && (
                <Box display="flex" justifyContent="center" mt={2}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(_, value) => setPage(value)}
                    sx={{
                      '& .MuiPaginationItem-root': {
                        borderRadius: '6px',
                        fontWeight: 500,
                        fontSize: '0.875rem',
                        '&.Mui-selected': {
                          background: brmsTheme.gradients.primary,
                        },
                      },
                    }}
                  />
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Menu
        anchorEl={menuAnchorEl}
        open={!!menuAnchorEl}
        onClose={handleMenuClose}
        sx={{
          '& .MuiPaper-root': {
            borderRadius: '10px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            minWidth: '140px',
          },
        }}
      >
        <MenuItem
          onClick={handleEdit}
          sx={{
            fontSize: '0.875rem',
            py: 1.25,
            '&:hover': {
              backgroundColor: '#F9FAFB',
            },
          }}
        >
          Edit
        </MenuItem>
        <MenuItem
          onClick={handleDelete}
          sx={{
            color: '#DC2626',
            fontSize: '0.875rem',
            py: 1.25,
            '&:hover': {
              backgroundColor: '#FEE2E2',
            },
          }}
        >
          Delete
        </MenuItem>
      </Menu>
    </>
  );
}