'use client';

import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { rulesApi, RuleResponse } from 'app/src/modules/rules/api/rulesApi';
import { projectsApi } from '../../hub/api/projectsApi';
import CreateRuleLeftPanel from '../components/CreateRuleLeftPanel';
import CreateRuleRightPanel from '../components/CreateRuleRightPanel';
import { FormState } from '../types/rulesTypes';

/* ─── Page ────────────────────────────────────────────────── */
export default function CreateRulePage() {
  const navigate = useNavigate();
  const { vertical_Key, project_key } = useParams<{ vertical_Key: string; project_key: string }>();
  const [searchParams] = useSearchParams();

  const ruleKey    = searchParams.get('key');
  const isEditMode = Boolean(ruleKey);

  const directoryParam = searchParams.get('directory')
    ? decodeURIComponent(searchParams.get('directory')!)
    : '';

  const [form, setForm]               = useState<FormState>({ name: '', description: '', directory: directoryParam || '' });
  const [loading, setLoading]         = useState(false);
  const [loadingRule, setLoadingRule] = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [focused, setFocused]         = useState<string | null>(null);
  const [projectName, setProjectName] = useState<string>('');

  useEffect(() => {
    if (!project_key || !vertical_Key) return;
    projectsApi.getProjectsView(vertical_Key).then((projects) => {
      const match = projects.find((p: { project_key: string; name: string }) => p.project_key === project_key);
      if (match?.name) setProjectName(match.name);
    });
  }, [project_key, vertical_Key]);

  useEffect(() => {
    if (!isEditMode) {
      setForm((prev) => ({ ...prev, directory: directoryParam }));
    }
  }, [directoryParam, isEditMode]);

  useEffect(() => {
    if (!ruleKey) return;
    (async () => {
      setLoadingRule(true);
      try {
        const rule = await rulesApi.getRuleDetails(ruleKey);
        if (!rule) { setError('Rule not found'); return; }
        const parts = (rule.directory || 'rule').split('/');
        const parentDirectory = parts.slice(0, -1).join('/') || 'rule';
        setForm({ name: rule.name, description: rule.description || '', directory: parentDirectory });
      } catch { setError('Failed to load rule'); }
      finally   { setLoadingRule(false); }
    })();
  }, [ruleKey]);

  /* ─── Handlers ─── */
  const handleFormChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleBack = () =>
    navigate(`/vertical/${vertical_Key}/dashboard/hub/${project_key}/rules`);

  const handleCancel = () =>
    navigate(`/vertical/${vertical_Key}/dashboard/hub/${project_key}/rules?path=${encodeURIComponent(form.directory)}`);

  const handleSubmit = async () => {
    setError(null);
    if (!form.name.trim()) { setError('Rule name is required'); return; }
    if (form.description.length > 300) { setError('Description cannot exceed 300 characters'); return; }
    if (!project_key) { setError('Project key is missing'); return; }

    try {
      const fullDirectory = form.directory ? `${form.directory}/${form.name}` : form.name;

      if (isEditMode && ruleKey) {
        const { rules: existingRules } = await rulesApi.getProjectRules(project_key, vertical_Key!);
        const duplicate = existingRules.some(
          (r: RuleResponse) => r.directory === fullDirectory && r.rule_key !== ruleKey
        );
        if (duplicate) { setError('A rule with that name already exists in this folder'); return; }

        await rulesApi.updateRuleNameAndDirectory({
          rule_key:    ruleKey,
          name:        form.name,
          directory:   fullDirectory,
          description: form.description,
          updated_by:  'admin',
        });
      } else {
        await rulesApi.createRule({
          project_key,
          name:        form.name,
          description: form.description,
          directory:   fullDirectory,
        });
      }

      navigate(`/vertical/${vertical_Key}/dashboard/hub/${project_key}/rules?path=${encodeURIComponent(form.directory)}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally { setLoading(false); }
  };

  /* ─── Derived ─── */
  const locationLabel = (() => {
    if (!form.directory) return projectName || 'Root';
    return form.directory.split('/').join(' › ');
  })();

  /* ─── Loading state ─── */
  if (loadingRule) {
    return (
      <Box sx={{ height: '100vh', background: '#0A0C10', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontFamily: '"DM Mono", monospace', fontSize: '0.875rem', letterSpacing: '0.04em' }}>
          Loading rule…
        </Typography>
      </Box>
    );
  }

  /* ─── Render ─── */
  return (
    <Box sx={{ height: '100vh', width: '100%', display: 'flex', overflow: 'hidden', background: '#0A0C10', fontFamily: '"DM Sans", "Inter", sans-serif' }}>

      {/* ─── LEFT PANEL ─── */}
      <CreateRuleLeftPanel
        isEditMode={isEditMode}
        onBack={handleBack}
      />

      {/* ─── RIGHT PANEL ─── */}
      <CreateRuleRightPanel
        isEditMode={isEditMode}
        form={form}
        loading={loading}
        error={error}
        focused={focused}
        locationLabel={locationLabel}
        onFormChange={handleFormChange}
        onFocus={setFocused}
        onBlur={() => setFocused(null)}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        onBack={handleBack}
      />
    </Box>
  );
}