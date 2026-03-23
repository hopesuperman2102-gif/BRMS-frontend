'use client';

import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Box, styled } from '@mui/material';
import { brmsTheme } from '@/core/theme/brmsTheme';
import { projectsApi } from '@/modules/hub/api/projectsApi';
import CreateProjectLeftPanel from '@/modules/hub/components/CreateProjectLeftPanel';
import { FormState } from '@/modules/hub/types/hubTypes';
import CreateProjectRightPanel from '@/modules/hub/components/CreateProjectRightPanel';
import { useRole } from '@/modules/auth/hooks/useRole';

const PageRoot = styled(Box)({
  height: '100vh',
  width: '100%',
  display: 'flex',
  overflow: 'hidden',
  background: brmsTheme.colors.bgDark,
  fontFamily: '"DM Sans", "Inter", sans-serif',
});

export default function CreateProjectPage() {
  const navigate = useNavigate();
  const { vertical_Key } = useParams();
  const { isRuleAuthor, isReviewer, isViewer } = useRole();
  const canManageProjects = !(isRuleAuthor || isReviewer || isViewer);
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

  useEffect(() => {
    if (!projectKey) return;
    (async () => {
      try {
        const projects = await projectsApi.getProjectsView(vertical_Key!);
        const project = projects.find((p) => p.project_key === projectKey);
        if (!project) { setError('Project not found'); return; }
        setForm({
          name: project.name,
          description: project.description || '',
          domain: project.domain || '',
        });
      } catch {
        setError('Failed to load project');
      }
    })();
  }, [projectKey, vertical_Key]);

  const handleChange = (field: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleBack = () => navigate(`/vertical/${vertical_Key}/dashboard/hub`);

  const handleSubmit = async () => {
    if (!canManageProjects) {
      setError('You do not have permission to create or edit projects');
      return;
    }
    setError(null);
    if (!form.name.trim()) { setError('Project name is required'); return; }
    if (form.description.length > 300) { setError('Description cannot exceed 300 characters'); return; }
    try {
      setLoading(true);
      const allProjects = await projectsApi.getProjectsView(vertical_Key!);
      const duplicate = allProjects.some(
        (p) =>
          p.name.toLowerCase().trim() === form.name.toLowerCase().trim() &&
          p.project_key !== projectKey,
      );
      if (duplicate) {
        setError('A project with this name already exists.');
        return;
      }
      if (isEditMode && projectKey) {
        await projectsApi.updateProject(projectKey, {
          name: form.name,
          description: form.description,
          domain: form.domain,
        });
      } else {
        await projectsApi.createProject({
          name: form.name,
          description: form.description,
          domain: form.domain,
          vertical_key: vertical_Key!,
        });
      }
      navigate(`/vertical/${vertical_Key}/dashboard/hub`);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message || 'Something went wrong' : 'Something went wrong',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageRoot>
      <CreateProjectLeftPanel
        isEditMode={isEditMode}
        onBack={handleBack}
      />
      <CreateProjectRightPanel
        isEditMode={isEditMode}
        form={form}
        loading={loading}
        error={error}
        onFieldChange={handleChange}
        onSubmit={handleSubmit}
        onCancel={handleBack}
        onBack={handleBack}
      />
    </PageRoot>
  );
}