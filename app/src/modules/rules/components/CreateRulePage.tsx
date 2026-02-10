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
import { rulesApi } from 'app/src/api/rulesApi';

type FormState = {
  name: string;
  description: string;
};

export default function CreateRulePage() {
  const navigate = useNavigate();
  const { project_key } = useParams<{ project_key: string }>();
  const [searchParams] = useSearchParams();

  const ruleKey = searchParams.get('key'); // edit
  const isEditMode = Boolean(ruleKey);

  const [form, setForm] = useState<FormState>({
    name: '',
    description: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ---------- Load rule for EDIT ---------- */
  useEffect(() => {
    if (!isEditMode || !project_key || !ruleKey) return;

    const loadRule = async () => {
      try {
        const rules = await rulesApi.getProjectRules(project_key);
        const rule = rules.find((r: any) => r.rule_key === ruleKey);

        if (!rule) {
          setError('Rule not found');
          return;
        }

        setForm({
          name: rule.name,
          description: rule.description || '',
        });
      } catch {
        setError('Failed to load rule');
      }
    };

    loadRule();
  }, [isEditMode, project_key, ruleKey]);

  /* ---------- Submit ---------- */
  const handleSubmit = async () => {
    setError(null);

    if (!form.name.trim()) {
      setError('Rule name is required');
      return;
    }

    try {
      setLoading(true);

      // 🔒 Duplicate name check
      const existingRules = await rulesApi.getProjectRules(project_key!);

      const duplicate = existingRules.some(
        (r: any) =>
          r.name.toLowerCase().trim() ===
            form.name.toLowerCase().trim() &&
          r.rule_key !== ruleKey
      );

      if (duplicate) {
        setError('Rule name already exists');
        setLoading(false);
        return;
      }

      // ✏️ Edit
      if (isEditMode && ruleKey) {
        await rulesApi.updateRule({
          rule_key: ruleKey,
          name: form.name,
          description: form.description,
          updated_by: 'admin',
        });
      }
      // ➕ Create
      else {
        await rulesApi.createRule({
          project_key: project_key!,
          name: form.name,
          description: form.description,
        });
      }

      navigate(`/dashboard/${project_key}/rules`);
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
          width: 520,
          bgcolor: brmsTheme.colors.primaryDark,
          borderRadius: 3,
          p: 4,
          color: brmsTheme.colors.textOnPrimary,
          boxShadow: brmsTheme.shadows.primaryHover,
        }}
      >
        <Typography variant="h5" fontWeight={700} mb={3}>
          {isEditMode ? 'Edit Rule' : 'Create Rule'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          label="Rule Name"
          fullWidth
          required
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
          sx={{ mb: 2 }}
        />

        <TextField
          label="Description"
          fullWidth
          multiline
          rows={3}
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
          sx={{ mb: 3 }}
        />

        <Box display="flex" justifyContent="flex-end" gap={2}>
          <Button
            variant="text"
            onClick={() =>
              navigate(`/dashboard/${project_key}/rules`)
            }
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            disabled={loading}
            onClick={handleSubmit}
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
