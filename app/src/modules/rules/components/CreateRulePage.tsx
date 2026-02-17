'use client';

import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Box, Typography, TextField, Button, Alert } from '@mui/material';
import { brmsTheme } from 'app/src/core/theme/brmsTheme';
import { rulesApi, RuleResponse } from 'app/src/modules/rules/api/rulesApi';

// ─── Types ────────────────────────────────────────────────────────────────────

type FormState = {
  name: string;
  description: string;
  directory: string;
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function CreateRulePage() {
  const navigate = useNavigate();
  const { vertical_Key, project_key } = useParams<{
    vertical_Key: string;
    project_key: string;
  }>();
  const [searchParams] = useSearchParams();

  const ruleKey = searchParams.get('key');           // present in edit mode
  const directoryParam = searchParams.get('directory'); // parent directory in create mode
  const isEditMode = Boolean(ruleKey);

  const [form, setForm] = useState<FormState>({
    name: '',
    description: '',
    directory: directoryParam || 'rule',
  });

  const [loading, setLoading] = useState(false);
  const [loadingRule, setLoadingRule] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Load rule in edit mode ─────────────────────────────────────────────────
  // REMOVED: dual-path logic that checked `location.state?.ruleDetails` first.
  // The navigation-state shortcut saved one API call but added two code paths,
  // a useLocation import, and an extra type cast — not worth the complexity.

  useEffect(() => {
    if (!ruleKey) return;

    const fetchRule = async () => {
      setLoadingRule(true);
      try {
        const rule = await rulesApi.getRuleDetails(ruleKey);
        if (!rule) { setError('Rule not found'); return; }

        // Strip the file name segment — keep only the parent directory
        const parts = (rule.directory || 'rule').split('/');
        const parentDirectory = parts.slice(0, -1).join('/') || 'rule';

        setForm({
          name: rule.name,
          description: rule.description || '',
          directory: parentDirectory,
        });
      } catch {
        setError('Failed to load rule');
      } finally {
        setLoadingRule(false);
      }
    };

    void fetchRule();
  }, [ruleKey]);

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    setError(null);

    if (!form.name.trim()) { setError('Rule name is required'); return; }
    if (!project_key)      { setError('Project key is missing'); return; }

    try {
      setLoading(true);

      const fullDirectory = `${form.directory}/${form.name}`;

      // Duplicate-name guard
      const existingRules = await rulesApi.getProjectRules(project_key);
      const duplicate = existingRules.some(
        (r: RuleResponse) =>
          r.directory === fullDirectory && r.rule_key !== ruleKey
      );

      if (duplicate) {
        setError('A rule with that name already exists in this folder');
        return;
      }

      if (isEditMode && ruleKey) {
        await rulesApi.updateRuleNameAndDirectory({
          rule_key: ruleKey,
          name: form.name,
          directory: fullDirectory,
          description: form.description,
          updated_by: 'admin',
        });
      } else {
        await rulesApi.createRule({
          project_key,
          name: form.name,
          description: form.description,
          directory: fullDirectory,
        });
      }

      navigate(
        `/vertical/${vertical_Key}/dashboard/hub/${project_key}/rules?path=${encodeURIComponent(form.directory)}`
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // ── Derived display values ─────────────────────────────────────────────────
  // FIX: was checking `parts[0] === 'rules'` (plural) but the root segment is
  //      'rule' (singular), so the label always fell through to the path join.

  const locationLabel = (() => {
    const parts = form.directory.split('/');
    if (parts.length === 1 && parts[0] === 'rule') return 'Root';
    return parts.slice(1).join(' > ') || 'Root';
  })();

  // ── Loading skeleton ───────────────────────────────────────────────────────

  if (loadingRule) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: '#F8F9FC',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography>Loading rule details…</Typography>
      </Box>
    );
  }

  // ── JSX ───────────────────────────────────────────────────────────────────

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
      <Box
        sx={{
          width: '100%',
          maxWidth: 580,
          bgcolor: '#ffffff',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)',
          border: '1px solid #E5E7EB',
        }}
      >
        {/* ── Header ── */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            px: 4, py: 4, position: 'relative', overflow: 'hidden',
            '&::before': {
              content: '""', position: 'absolute',
              top: -50, right: -50, width: 200, height: 200,
              borderRadius: '50%', background: 'rgba(255,255,255,0.1)',
            },
            '&::after': {
              content: '""', position: 'absolute',
              bottom: -30, left: -30, width: 150, height: 150,
              borderRadius: '50%', background: 'rgba(255,255,255,0.08)',
            },
          }}
        >
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, color: '#fff', position: 'relative', zIndex: 1, letterSpacing: '-0.02em' }}
          >
            {isEditMode ? 'Edit Rule' : 'Create New Rule'}
          </Typography>
          <Typography
            sx={{ color: 'rgba(255,255,255,0.9)', mt: 1, fontSize: '0.95rem', position: 'relative', zIndex: 1 }}
          >
            {isEditMode
              ? 'Update your rule information below'
              : 'Fill in the details to create a new rule'}
          </Typography>
        </Box>

        {/* ── Form ── */}
        <Box sx={{ px: 4, py: 4 }}>
          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3, borderRadius: '12px', border: '1px solid #FEE2E2',
                '& .MuiAlert-icon': { color: '#DC2626' },
              }}
            >
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Rule Name */}
            <Box>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151', mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                Rule Name
                <Box component="span" sx={{ color: '#DC2626' }}>*</Box>
              </Typography>
              <TextField
                fullWidth
                required
                placeholder="Enter rule name"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                sx={fieldSx}
              />
            </Box>

            {/* Description */}
            <Box>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151', mb: 1 }}>
                Description
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Describe your rule (optional)"
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                sx={fieldSx}
              />
            </Box>

            {/* Location */}
            <Box sx={{ p: 2, borderRadius: '10px', backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}>
                Location
              </Typography>
              <Typography sx={{ fontSize: '0.9rem', fontWeight: 500, color: '#374151' }}>
                {locationLabel}
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#9CA3AF', mt: 1 }}>
                Full path:{' '}
                <Box component="span" sx={{ fontFamily: 'monospace', color: '#6B7280' }}>
                  {form.directory}/{form.name || '[rule name]'}
                </Box>
              </Typography>
            </Box>
          </Box>

          {/* Actions */}
          <Box
            sx={{
              display: 'flex', justifyContent: 'flex-end', gap: 2,
              mt: 4, pt: 3, borderTop: '1px solid #F3F4F6',
            }}
          >
            <Button
              variant="outlined"
              onClick={() =>
                navigate(
                  `/vertical/${vertical_Key}/dashboard/hub/${project_key}/rules?path=${encodeURIComponent(form.directory)}`
                )
              }
              sx={cancelBtnSx}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              disabled={loading}
              onClick={handleSubmit}
              sx={submitBtnSx}
            >
              {loading ? 'Saving…' : isEditMode ? 'Update Rule' : 'Create Rule'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

// ─── Shared sx objects (extracted to reduce inline noise) ─────────────────────

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    backgroundColor: '#F9FAFB',
    transition: 'all 0.2s',
    '& fieldset': { borderColor: '#E5E7EB' },
    '&:hover': { backgroundColor: '#fff', '& fieldset': { borderColor: '#9CA3AF' } },
    '&.Mui-focused': {
      backgroundColor: '#fff',
      '& fieldset': { borderColor: '#6552D0', borderWidth: '2px' },
    },
  },
  '& .MuiInputBase-input': { fontSize: '0.95rem' },
} as const;

const cancelBtnSx = {
  borderRadius: '10px', px: 3, py: 1.25,
  textTransform: 'none', fontSize: '0.95rem', fontWeight: 600,
  borderColor: '#E5E7EB', color: '#6B7280',
  '&:hover': { borderColor: '#9CA3AF', backgroundColor: '#F9FAFB' },
} as const;

const submitBtnSx = {
  borderRadius: '10px', px: 4, py: 1.25,
  textTransform: 'none', fontSize: '0.95rem', fontWeight: 600,
  background: brmsTheme.gradients.primary,
  boxShadow: '0 4px 12px rgba(101,82,208,0.25)',
  '&:hover': {
    background: brmsTheme.gradients.primaryHover,
    boxShadow: '0 6px 16px rgba(101,82,208,0.35)',
    transform: 'translateY(-1px)',
  },
  '&:disabled': { background: '#E5E7EB', color: '#9CA3AF', boxShadow: 'none' },
  transition: 'all 0.2s',
} as const;