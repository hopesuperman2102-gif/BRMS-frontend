'use client';

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
} from '@mui/material';
import { brmsTheme } from 'app/src/core/theme/brmsTheme';
import { projectsApi } from 'app/src/api/projectsApi';

type FormState = {
  name: string;
  description: string;
  domain: string;
};

export default function CreateProjectPage() {
  const navigate = useNavigate();
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
          (p: any) => p.project_key === projectKey
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
      } catch (err) {
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

      const duplicate = allProjects.some((p: any) =>
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
        await projectsApi.createProject({
          name: form.name,
          description: form.description,
          domain: form.domain,
        });
      }

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: brmsTheme.gradients.primary,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4,
      }}
    >
      <Box
        sx={{
          width: 420,
          bgcolor: '#fff',
          borderRadius: 3,
          p: 4,
          boxShadow: brmsTheme.shadows.primarySoft,
        }}
      >
        <Typography variant="h5" fontWeight={700} mb={3}>
          {isEditMode ? 'Edit Project' : 'Create Project'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          label="Project Name"
          fullWidth
          required
          value={form.name}
          onChange={(e) => handleChange('name', e.target.value)}
          sx={{ mb: 2 }}
        />

        <TextField
          label="Description"
          fullWidth
          value={form.description}
          onChange={(e) => handleChange('description', e.target.value)}
          sx={{ mb: 2 }}
        />

       <TextField
          label="Domain"
          fullWidth
          value={form.domain}
          onChange={(e) => handleChange('domain', e.target.value)}
          sx={{ mb: 2 }}
        />

        <Box display="flex" justifyContent="flex-end" gap={2}>
          <Button
            variant="text"
            onClick={() => navigate('/dashboard')}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            disabled={loading}
            onClick={handleSubmit}
            sx={{
              background: brmsTheme.gradients.primary,
              boxShadow: brmsTheme.shadows.primarySoft,
              '&:hover': {
                background: brmsTheme.gradients.primaryHover,
              },
            }}
          >
            {loading
              ? 'Saving...'
              : isEditMode
              ? 'Update'
              : 'Create'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
