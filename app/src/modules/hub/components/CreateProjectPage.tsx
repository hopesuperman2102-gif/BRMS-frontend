'use client';

import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
} from '@mui/material';
import { brmsTheme } from 'app/src/core/theme/brmsTheme';
import { projectsApi } from 'app/src/modules/hub/api/projectsApi';
import { verticalsApi } from '../../vertical/api/verticalsApi';

type FormState = {
  name: string;
  description: string;
  domain: string;
};

export default function CreateProjectPage() {
  const navigate = useNavigate();
  const { verticalId } = useParams(); 
  const [searchParams] = useSearchParams();
  const projectKey = searchParams.get('key');
  const isEditMode = Boolean(projectKey);

  const [form, setForm] = useState<FormState>({
    name: '',
    description: '',
    domain: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ---------- Load project when editing ---------- */
  useEffect(() => {
    if (!projectKey) return;

    const fetchProject = async () => {
      try {
        const projects = await projectsApi.getProjectsView();
        const project = projects.find(
          (p) => p.project_key === projectKey
        );

        if (!project) {
          setError('Project not found');
          return;
        }

        setForm({
          name: project.name,
          description: project.description || '',
          domain: project.domain || '',
        });
      } catch {
        setError('Failed to load project');
      }
    };

    fetchProject();
  }, [projectKey]);

  /* ---------- Field change ---------- */
  const handleChange = (
    field: keyof FormState,
    value: string
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  /* ---------- Submit ---------- */
  const handleSubmit = async () => {
    setError(null);

    // Mandatory validation
    if (!form.name.trim()) {
      setError('Project name is required');
      return;
    }

    try {
      setLoading(true);

      //  Duplicate name validation
      const allProjects = await projectsApi.getProjectsView();

      const duplicate = allProjects.some(
        (p) =>
          p.name.toLowerCase().trim() === form.name.toLowerCase().trim() &&
          p.project_key !== projectKey
      );

      if (duplicate) {
        setError('Project name already exists. Please use a different name.');
        setLoading(false);
        return;
      }

      //  Edit
      if (isEditMode && projectKey) {
        await projectsApi.updateProject(projectKey, {
          name: form.name,
          description: form.description,
          domain: form.domain,
        });
      }
      //  Create
      else {
        if (!verticalId) {
          setError('Vertical ID is missing');
          setLoading(false);
          return;
        }

        // Get vertical_key from verticalId
        const verticalKey = await verticalsApi.getVerticalKeyById(verticalId);

        await projectsApi.createProject({
          name: form.name,
          description: form.description,
          domain: form.domain,
          vertical_key: verticalKey,
        });
      }

      navigate(`/vertical/${verticalId}/dashboard/hub`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Something went wrong');
      } else {
        setError('Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: '#F8F9FC',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4,
      }}
    >
      {/* Main Card Container */}
      <Box
        sx={{
          width: '100%',
          maxWidth: 580,
          bgcolor: '#ffffff',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(0, 0, 0, 0.04)',
          border: '1px solid #E5E7EB',
        }}
      >
        {/* Header Section */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            px: 4,
            py: 4,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -30,
              left: -30,
              width: 150,
              height: 150,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.08)',
            },
          }}
        >
          <Typography 
            variant="h4" 
            sx={{
              fontWeight: 700,
              color: '#ffffff',
              position: 'relative',
              zIndex: 1,
              letterSpacing: '-0.02em',
            }}
          >
            {isEditMode ? 'Edit Project' : 'Create New Project'}
          </Typography>
          <Typography 
            sx={{
              color: 'rgba(255, 255, 255, 0.9)',
              mt: 1,
              fontSize: '0.95rem',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {isEditMode 
              ? 'Update your project information below' 
              : 'Fill in the details to create a new project'}
          </Typography>
        </Box>

        {/* Form Section */}
        <Box sx={{ px: 4, py: 4 }}>
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: '12px',
                border: '1px solid #FEE2E2',
                '& .MuiAlert-icon': {
                  color: '#DC2626',
                },
              }}
            >
              {error}
            </Alert>
          )}

          {/* Form Fields */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <Typography
                sx={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#374151',
                  mb: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                Project Name
                <Box component="span" sx={{ color: '#DC2626' }}>*</Box>
              </Typography>
              <TextField
                fullWidth
                required
                placeholder="Enter project name"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                    backgroundColor: '#F9FAFB',
                    transition: 'all 0.2s',
                    '& fieldset': {
                      borderColor: '#E5E7EB',
                    },
                    '&:hover': {
                      backgroundColor: '#ffffff',
                      '& fieldset': {
                        borderColor: '#9CA3AF',
                      },
                    },
                    '&.Mui-focused': {
                      backgroundColor: '#ffffff',
                      '& fieldset': {
                        borderColor: brmsTheme.colors.primary,
                        borderWidth: '2px',
                      },
                    },
                  },
                  '& .MuiInputBase-input': {
                    fontSize: '0.95rem',
                  },
                }}
              />
            </Box>

            <Box>
              <Typography
                sx={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#374151',
                  mb: 1,
                }}
              >
                Description
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Describe your project (optional)"
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                    backgroundColor: '#F9FAFB',
                    transition: 'all 0.2s',
                    '& fieldset': {
                      borderColor: '#E5E7EB',
                    },
                    '&:hover': {
                      backgroundColor: '#ffffff',
                      '& fieldset': {
                        borderColor: '#9CA3AF',
                      },
                    },
                    '&.Mui-focused': {
                      backgroundColor: '#ffffff',
                      '& fieldset': {
                        borderColor: brmsTheme.colors.primary,
                        borderWidth: '2px',
                      },
                    },
                  },
                  '& .MuiInputBase-input': {
                    fontSize: '0.95rem',
                  },
                }}
              />
            </Box>

            <Box>
              <Typography
                sx={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#374151',
                  mb: 1,
                }}
              >
                Domain
              </Typography>
              <TextField
                fullWidth
                placeholder="e.g., finance, healthcare, retail"
                value={form.domain}
                onChange={(e) => handleChange('domain', e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                    backgroundColor: '#F9FAFB',
                    transition: 'all 0.2s',
                    '& fieldset': {
                      borderColor: '#E5E7EB',
                    },
                    '&:hover': {
                      backgroundColor: '#ffffff',
                      '& fieldset': {
                        borderColor: '#9CA3AF',
                      },
                    },
                    '&.Mui-focused': {
                      backgroundColor: '#ffffff',
                      '& fieldset': {
                        borderColor: brmsTheme.colors.primary,
                        borderWidth: '2px',
                      },
                    },
                  },
                  '& .MuiInputBase-input': {
                    fontSize: '0.95rem',
                  },
                }}
              />
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: 2,
              mt: 4,
              pt: 3,
              borderTop: '1px solid #F3F4F6',
            }}
          >
            <Button
              variant="outlined"
              onClick={() => navigate(`/vertical/${verticalId}/dashboard/hub`)}
              sx={{
                borderRadius: '10px',
                px: 3,
                py: 1.25,
                textTransform: 'none',
                fontSize: '0.95rem',
                fontWeight: 600,
                borderColor: '#E5E7EB',
                color: '#6B7280',
                '&:hover': {
                  borderColor: '#9CA3AF',
                  backgroundColor: '#F9FAFB',
                },
              }}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              disabled={loading}
              onClick={handleSubmit}
              sx={{
                borderRadius: '10px',
                px: 4,
                py: 1.25,
                textTransform: 'none',
                fontSize: '0.95rem',
                fontWeight: 600,
                background: brmsTheme.gradients.primary,
                boxShadow: '0 4px 12px rgba(101, 82, 208, 0.25)',
                '&:hover': {
                  background: brmsTheme.gradients.primaryHover,
                  boxShadow: '0 6px 16px rgba(101, 82, 208, 0.35)',
                  transform: 'translateY(-1px)',
                },
                '&:disabled': {
                  background: '#E5E7EB',
                  color: '#9CA3AF',
                  boxShadow: 'none',
                },
                transition: 'all 0.2s',
              }}
            >
              {loading
                ? 'Saving...'
                : isEditMode
                ? 'Update Project'
                : 'Create Project'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}