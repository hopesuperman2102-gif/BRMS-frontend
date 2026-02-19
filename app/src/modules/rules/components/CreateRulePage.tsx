'use client';

import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Box, Typography, TextField, Button, Alert } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { rulesApi, RuleResponse } from 'app/src/modules/rules/api/rulesApi';

/* ─── Design Tokens ──────────────────────────────────────── */
const T = {
  bgRoot:      '#0A0C10',
  bgLeft:      '#0A0C10',
  bgRight:     '#F7F8FA',
  indigo:      '#4F46E5',
  indigoHover: '#4338CA',
  indigoMuted: 'rgba(79,70,229,0.10)',
  indigoGlow:  'rgba(79,70,229,0.20)',
  dTextHigh:   '#FFFFFF',
  dTextMid:    'rgba(255,255,255,0.45)',
  dTextLow:    'rgba(255,255,255,0.18)',
  dBorder:     'rgba(255,255,255,0.06)',
  lTextHigh:   '#0F172A',
  lTextMid:    '#475569',
  lTextLow:    '#94A3B8',
  lBorder:     '#E2E8F0',
  lBorderFocus:'#4F46E5',
  errorBg:     '#FEF2F2',
  errorBorder: '#FECACA',
  errorText:   '#B91C1C',
  errorIcon:   '#F87171',
};

/* ─── Input style factory ─────────────────────────────────── */
const inputSx = (focused: boolean) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '6px',
    backgroundColor: '#FFFFFF',
    transition: 'box-shadow 0.15s, border-color 0.15s',
    ...(focused && { boxShadow: `0 0 0 3px ${T.indigoGlow}` }),
    '& fieldset': {
      borderColor: focused ? T.lBorderFocus : T.lBorder,
      borderWidth: focused ? '1.5px' : '1px',
      transition: 'border-color 0.15s',
    },
    '&:hover fieldset': { borderColor: focused ? T.lBorderFocus : '#CBD5E1' },
  },
  '& .MuiInputBase-input': {
    fontSize: '0.875rem',
    fontFamily: '"DM Mono", "Fira Code", monospace',
    color: T.lTextHigh,
    padding: '10px 14px',
    letterSpacing: '0.01em',
    '&::placeholder': { color: T.lTextLow, opacity: 1, fontFamily: '"DM Mono", monospace' },
  },
  '& .MuiInputBase-inputMultiline': {
    fontSize: '0.875rem',
    fontFamily: '"DM Mono", "Fira Code", monospace',
    color: T.lTextHigh,
    lineHeight: 1.65,
    letterSpacing: '0.01em',
  },
});

/* ─── Label ───────────────────────────────────────────────── */
const Label = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '6px' }}>
    <Typography sx={{
      fontSize: '0.6875rem', fontWeight: 600, color: T.lTextMid,
      letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: '"DM Mono", monospace',
    }}>
      {children}
    </Typography>
    {required && (
      <Typography sx={{
        fontSize: '0.625rem', fontWeight: 700, color: T.indigo,
        letterSpacing: '0.07em', textTransform: 'uppercase',
        fontFamily: '"DM Mono", monospace', opacity: 0.75,
      }}>
        required
      </Typography>
    )}
  </Box>
);

/* ─── Feature item ────────────────────────────────────────── */
const Feature = ({ children, last }: { children: string; last?: boolean }) => (
  <Box sx={{
    display: 'flex', alignItems: 'center', gap: '12px', py: '12px',
    borderBottom: last ? 'none' : `1px solid ${T.dBorder}`,
  }}>
    <Box sx={{ width: '4px', height: '4px', borderRadius: '50%', bgcolor: T.indigo, flexShrink: 0 }} />
    <Typography sx={{ fontSize: '0.8rem', color: T.dTextMid, fontWeight: 400, lineHeight: 1, letterSpacing: '0.01em' }}>
      {children}
    </Typography>
  </Box>
);

/* ─── Types ───────────────────────────────────────────────── */
type FormState = { name: string; description: string; directory: string };

/* ─── Page ────────────────────────────────────────────────── */
export default function CreateRulePage() {
  const navigate = useNavigate();
  // vertical_Key is always present in the route — guaranteed by the router config
  const { vertical_Key, project_key } = useParams<{ vertical_Key: string; project_key: string }>();
  const [searchParams] = useSearchParams();

  const ruleKey    = searchParams.get('key');
  const isEditMode = Boolean(ruleKey);

  // Read directory from URL — decodeURIComponent handles encoded paths like "rule%2FMyFolder"
  const directoryParam = searchParams.get('directory')
    ? decodeURIComponent(searchParams.get('directory')!)
    : 'rule';

  const [form, setForm]               = useState<FormState>({ name: '', description: '', directory: directoryParam });
  const [loading, setLoading]         = useState(false);
  const [loadingRule, setLoadingRule] = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [focused, setFocused]         = useState<string | null>(null);

  // Sync directory from URL into form when it changes (handles navigation between folders)
  useEffect(() => {
    if (!isEditMode) {
      setForm((prev) => ({ ...prev, directory: directoryParam }));
    }
  }, [directoryParam, isEditMode]);

  /* Load rule in edit mode */
  useEffect(() => {
    if (!ruleKey) return;
    (async () => {
      setLoadingRule(true);
      try {
        const rule = await rulesApi.getRuleDetails(ruleKey);
        if (!rule) { setError('Rule not found'); return; }
        // directory stored as full path e.g. "rule/FolderA/RuleName"
        // parent = "rule/FolderA"
        const parts = (rule.directory || 'rule').split('/');
        const parentDirectory = parts.slice(0, -1).join('/') || 'rule';
        setForm({ name: rule.name, description: rule.description || '', directory: parentDirectory });
      } catch { setError('Failed to load rule'); }
      finally   { setLoadingRule(false); }
    })();
  }, [ruleKey]);

  /* Submit */
  const handleSubmit = async () => {
    setError(null);
    if (!form.name.trim()) { setError('Rule name is required'); return; }
    if (form.description.length > 300) { setError('Description cannot exceed 300 characters'); return; }
    if (!project_key) { setError('Project key is missing'); return; }

    try {
      setLoading(true);
      // fullDirectory = "rule/FolderName/RuleName" or "rule/RuleName" at root
      const fullDirectory = `${form.directory}/${form.name}`;

      if (isEditMode && ruleKey) {
        // vertical_Key is always present (route guarantee) — use ! to satisfy TS
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

  /* Location label */
  const locationLabel = (() => {
    const parts = form.directory.split('/');
    if (parts.length === 1 && parts[0] === 'rule') return 'Root';
    return parts.slice(1).join(' › ') || 'Root';
  })();

  /* Loading state */
  if (loadingRule) {
    return (
      <Box sx={{ height: '100vh', background: T.bgRoot, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography sx={{ color: T.dTextMid, fontFamily: '"DM Mono", monospace', fontSize: '0.875rem', letterSpacing: '0.04em' }}>
          Loading rule…
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', width: '100%', display: 'flex', overflow: 'hidden', background: T.bgRoot, fontFamily: '"DM Sans", "Inter", sans-serif' }}>

      {/* ══════════════════════════════════════════
          LEFT PANEL
      ══════════════════════════════════════════ */}
      <Box sx={{
        display: { xs: 'none', lg: 'flex' },
        flexDirection: 'column',
        width: '42%',
        flexShrink: 0,
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
        background: T.bgLeft,
        borderRight: `1px solid ${T.dBorder}`,
      }}>
        {/* Glow */}
        <Box sx={{ position: 'absolute', bottom: -80, left: -80, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,70,229,0.14) 0%, transparent 60%)', pointerEvents: 'none' }} />
        {/* Dot grid */}
        <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.09, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%', px: '48px', py: '40px' }}>

          {/* Back */}
          <Box sx={{ flexShrink: 0, mb: 'auto' }}>
            <Button
              startIcon={<ArrowBackIcon sx={{ fontSize: '12px !important' }} />}
              onClick={() => navigate(`/vertical/${vertical_Key}/dashboard/hub/${project_key}/rules`)}
              disableRipple
              sx={{ textTransform: 'none', fontWeight: 500, fontSize: '0.75rem', color: T.dTextMid, px: 0, minWidth: 0, background: 'none', letterSpacing: '0.02em', '&:hover': { color: T.dTextHigh, background: 'none' }, transition: 'color 0.15s' }}
            >
              Rules
            </Button>
          </Box>

          {/* Hero copy */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: '8px', mb: '24px' }}>
              <Box sx={{ width: '6px', height: '6px', borderRadius: '50%', bgcolor: T.indigo, boxShadow: `0 0 8px ${T.indigoGlow}` }} />
              <Typography sx={{ fontSize: '0.625rem', fontWeight: 700, color: T.dTextLow, letterSpacing: '0.16em', textTransform: 'uppercase', fontFamily: '"DM Mono", monospace' }}>
                {isEditMode ? 'Editing · Rule' : 'New · Rule'}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: 'clamp(2rem, 2.6vw, 2.75rem)', fontWeight: 800, color: T.dTextHigh, lineHeight: 1.05, letterSpacing: '-0.04em', mb: '20px', whiteSpace: 'pre-line' }}>
              {isEditMode ? 'Refine your\nrule.' : 'Define your\nlogic.'}
            </Typography>
            <Typography sx={{ fontSize: '0.8125rem', color: T.dTextMid, lineHeight: 1.8, mb: '40px', maxWidth: '300px', fontWeight: 400 }}>
              {isEditMode
                ? 'Update your rule details to keep your decision logic accurate and your team aligned.'
                : 'Rules are the building blocks of your decision engine. Name it, describe it, and place it.'}
            </Typography>
            <Box>
              {['Folder-based rule organisation', 'Full path tracking & versioning', 'Plugs into your JDM decision graph'].map((label, i) => (
                <Feature key={label} last={i === 2}>{label}</Feature>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ══════════════════════════════════════════
          RIGHT PANEL
      ══════════════════════════════════════════ */}
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', overflow: 'auto', position: 'relative', background: T.bgRight, px: { xs: '24px', sm: '48px', lg: '72px' } }}>

        {/* Mobile back */}
        <Box sx={{ display: { xs: 'flex', lg: 'none' }, position: 'absolute', top: '20px', left: '20px', zIndex: 2 }}>
          <Button
            startIcon={<ArrowBackIcon sx={{ fontSize: '12px !important' }} />}
            onClick={() => navigate(`/vertical/${vertical_Key}/dashboard/hub/${project_key}/rules`)}
            disableRipple
            sx={{ textTransform: 'none', fontWeight: 500, fontSize: '0.75rem', color: T.indigo, px: 0, minWidth: 0, background: 'none', '&:hover': { color: T.indigoHover, background: 'none' } }}
          >
            Rules
          </Button>
        </Box>

        {/* Form */}
        <Box sx={{ width: '100%', maxWidth: '420px', py: '48px' }}>
          <Box sx={{ width: '32px', height: '2px', borderRadius: '1px', background: T.indigo, mb: '24px', opacity: 0.9 }} />

          <Box sx={{ mb: '32px' }}>
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: T.lTextHigh, letterSpacing: '-0.03em', lineHeight: 1.1, mb: '8px' }}>
              {isEditMode ? 'Edit rule' : 'Create rule'}
            </Typography>
            <Typography sx={{ fontSize: '0.8125rem', color: T.lTextMid, fontWeight: 400, lineHeight: 1.65 }}>
              {isEditMode ? 'Update the fields below and save your changes.' : 'Fill in the details below to define your new rule.'}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: '24px', borderRadius: '6px', py: '6px', background: T.errorBg, border: `1px solid ${T.errorBorder}`, color: T.errorText, fontSize: '0.8125rem', fontWeight: 500, '& .MuiAlert-icon': { color: T.errorIcon, fontSize: '1rem' } }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Rule name */}
            <Box>
              <Label required>Rule Name</Label>
              <TextField
                fullWidth
                placeholder="e.g. Eligibility Check"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                onFocus={() => setFocused('name')}
                onBlur={() => setFocused(null)}
                onKeyDown={(e) => { if (e.key === 'Enter') void handleSubmit(); }}
                sx={inputSx(focused === 'name')}
              />
            </Box>

            {/* Description */}
            <Box>
              <Label>Description</Label>
              <TextField
                fullWidth multiline rows={3}
                placeholder="Describe what this rule evaluates or decides…"
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                onFocus={() => setFocused('description')}
                onBlur={() => setFocused(null)}
                sx={inputSx(focused === 'description')}
              />
              <Typography sx={{ mt: '4px', fontSize: '0.6875rem', color: form.description.length > 300 ? '#EF4444' : T.lTextLow, fontFamily: '"DM Mono", monospace', textAlign: 'right' }}>
                {form.description.length}/300
              </Typography>
            </Box>

            {/* Location — read-only */}
            <Box>
              <Label>Location</Label>
              <Box sx={{ borderRadius: '6px', border: `1px solid ${T.lBorder}`, background: '#FFFFFF', px: '14px', py: '12px' }}>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: T.lTextHigh, mb: '6px', letterSpacing: '-0.01em' }}>
                  {locationLabel}
                </Typography>
                <Typography sx={{ fontSize: '0.6875rem', color: T.lTextLow, fontFamily: '"DM Mono", monospace', letterSpacing: '0.02em' }}>
                  Full path : {form.directory}/{form.name || '[rule-name]'}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ height: '1px', bgcolor: T.lBorder, mt: '32px', mb: '24px' }} />

          <Box sx={{ display: 'flex', gap: '10px' }}>
            <Button
              disableRipple
              onClick={() => navigate(`/vertical/${vertical_Key}/dashboard/hub/${project_key}/rules?path=${encodeURIComponent(form.directory)}`)}
              sx={{ borderRadius: '6px', py: '10px', px: '20px', textTransform: 'none', fontWeight: 600, fontSize: '0.8125rem', color: T.lTextMid, border: `1px solid ${T.lBorder}`, background: '#FFFFFF', whiteSpace: 'nowrap', letterSpacing: '0.01em', '&:hover': { background: '#F1F5F9', borderColor: '#CBD5E1', color: T.lTextHigh }, transition: 'all 0.15s' }}
            >
              Cancel
            </Button>
            <Button
              fullWidth disabled={loading} disableRipple
              onClick={handleSubmit}
              sx={{ borderRadius: '6px', py: '10px', textTransform: 'none', fontWeight: 700, fontSize: '0.8125rem', color: '#FFFFFF', letterSpacing: '0.01em', background: T.indigo, boxShadow: `0 1px 3px rgba(0,0,0,0.12), 0 4px 12px ${T.indigoGlow}`, '&:hover': { background: T.indigoHover, boxShadow: `0 1px 3px rgba(0,0,0,0.16), 0 6px 20px rgba(79,70,229,0.28)`, transform: 'translateY(-1px)' }, '&:disabled': { background: '#E2E8F0', color: '#94A3B8', boxShadow: 'none', transform: 'none' }, transition: 'all 0.15s' }}
            >
              {loading ? 'Saving…' : isEditMode ? 'Save changes' : 'Create rule'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}