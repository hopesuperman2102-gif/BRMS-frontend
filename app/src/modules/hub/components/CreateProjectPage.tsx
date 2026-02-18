'use client';

/**
 * CreateProjectPage — Enterprise Redesign
 * Design system: Neutral slate + single vivid indigo accent
 * Typography: Tight, intentional hierarchy — no decorative noise
 * Alignment: 8px grid, every element optically anchored
 */

import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { projectsApi } from 'app/src/modules/hub/api/projectsApi';

type FormState = {
  name: string;
  description: string;
  domain: string;
};

/* ─── Design Tokens ───────────────────────────────────────── */
const T = {
  // Surface
  bgRoot:      '#0A0C10',
  bgLeft:      '#0A0C10',
  bgRight:     '#F7F8FA',
  // Brand
  indigo:      '#4F46E5',
  indigoHover: '#4338CA',
  indigoMuted: 'rgba(79,70,229,0.10)',
  indigoGlow:  'rgba(79,70,229,0.20)',
  // Text — dark surface
  dTextHigh:   '#FFFFFF',
  dTextMid:    'rgba(255,255,255,0.45)',
  dTextLow:    'rgba(255,255,255,0.18)',
  // Text — light surface
  lTextHigh:   '#0F172A',
  lTextMid:    '#475569',
  lTextLow:    '#94A3B8',
  // Borders
  dBorder:     'rgba(255,255,255,0.06)',
  lBorder:     '#E2E8F0',
  lBorderFocus:'#4F46E5',
  // Error
  errorBg:     '#FEF2F2',
  errorBorder: '#FECACA',
  errorText:   '#B91C1C',
  errorIcon:   '#F87171',
};

/* ─── Shared input style factory ─────────────────────────── */
const inputSx = (focused: boolean) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '6px',
    backgroundColor: '#FFFFFF',
    transition: 'box-shadow 0.15s, border-color 0.15s',
    ...(focused && {
      boxShadow: `0 0 0 3px ${T.indigoGlow}`,
    }),
    '& fieldset': {
      borderColor: focused ? T.lBorderFocus : T.lBorder,
      borderWidth: focused ? '1.5px' : '1px',
      transition: 'border-color 0.15s',
    },
    '&:hover fieldset': {
      borderColor: focused ? T.lBorderFocus : '#CBD5E1',
    },
  },
  '& .MuiInputBase-input': {
    fontSize: '0.875rem',
    fontFamily: '"DM Mono", "Fira Code", monospace',
    color: T.lTextHigh,
    padding: '10px 14px',
    letterSpacing: '0.01em',
    '&::placeholder': {
      color: T.lTextLow,
      opacity: 1,
      fontFamily: '"DM Mono", "Fira Code", monospace',
    },
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
const Label = ({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      mb: '6px',
    }}
  >
    <Typography
      sx={{
        fontSize: '0.6875rem',
        fontWeight: 600,
        color: T.lTextMid,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        fontFamily: '"DM Mono", monospace',
      }}
    >
      {children}
    </Typography>
    {required && (
      <Typography
        sx={{
          fontSize: '0.625rem',
          fontWeight: 700,
          color: T.indigo,
          letterSpacing: '0.07em',
          textTransform: 'uppercase',
          fontFamily: '"DM Mono", monospace',
          opacity: 0.75,
        }}
      >
        required
      </Typography>
    )}
  </Box>
);

/* ─── Feature item (left panel) ──────────────────────────── */
const Feature = ({
  children,
  last,
}: {
  children: string;
  last?: boolean;
}) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      py: '12px',
      borderBottom: last ? 'none' : `1px solid ${T.dBorder}`,
    }}
  >
    <Box
      sx={{
        width: '4px',
        height: '4px',
        borderRadius: '50%',
        bgcolor: T.indigo,
        flexShrink: 0,
      }}
    />
    <Typography
      sx={{
        fontSize: '0.8rem',
        color: T.dTextMid,
        fontWeight: 400,
        lineHeight: 1,
        letterSpacing: '0.01em',
      }}
    >
      {children}
    </Typography>
  </Box>
);

/* ─── Page ────────────────────────────────────────────────── */
export default function CreateProjectPage() {
  const navigate = useNavigate();
  const { vertical_Key } = useParams();
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
  const [focused, setFocused] = useState<string | null>(null);

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

  const handleSubmit = async () => {
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
    <Box
      sx={{
        height: '100vh',
        width: '100%',
        display: 'flex',
        overflow: 'hidden',
        background: T.bgRoot,
        fontFamily: '"DM Sans", "Inter", sans-serif',
      }}
    >
      {/* ══════════════════════════════════════════
          LEFT PANEL — dark, contextual copy
      ══════════════════════════════════════════ */}
      <Box
        sx={{
          display: { xs: 'none', lg: 'flex' },
          flexDirection: 'column',
          width: '42%',
          flexShrink: 0,
          height: '100vh',
          position: 'relative',
          overflow: 'hidden',
          background: T.bgLeft,
          borderRight: `1px solid ${T.dBorder}`,
        }}
      >
        {/* Subtle indigo vignette — bottom-left only */}
        <Box
          sx={{
            position: 'absolute',
            bottom: -80,
            left: -80,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(79,70,229,0.14) 0%, transparent 60%)',
            pointerEvents: 'none',
          }}
        />

        {/* Fine dot grid */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            opacity: 0.09,
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        {/* Content */}
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            px: '48px',
            py: '40px',
          }}
        >
          {/* Back */}
          <Box sx={{ flexShrink: 0, mb: 'auto' }}>
            <Button
              startIcon={<ArrowBackIcon sx={{ fontSize: '12px !important' }} />}
              onClick={() => navigate(`/vertical/${vertical_Key}/dashboard/hub`)}
              disableRipple
              sx={{
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.75rem',
                color: T.dTextMid,
                px: 0,
                minWidth: 0,
                background: 'none',
                letterSpacing: '0.02em',
                gap: '4px',
                '&:hover': { color: T.dTextHigh, background: 'none' },
                transition: 'color 0.15s',
              }}
            >
              Hub
            </Button>
          </Box>

          {/* Hero copy — vertically centered */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

            {/* Mode badge */}
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                mb: '24px',
              }}
            >
              <Box
                sx={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  bgcolor: T.indigo,
                  boxShadow: `0 0 8px ${T.indigoGlow}`,
                }}
              />
              <Typography
                sx={{
                  fontSize: '0.625rem',
                  fontWeight: 700,
                  color: T.dTextLow,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  fontFamily: '"DM Mono", monospace',
                }}
              >
                {isEditMode ? 'Editing · Project' : 'New · Project'}
              </Typography>
            </Box>

            {/* Headline */}
            <Typography
              sx={{
                fontSize: 'clamp(2rem, 2.6vw, 2.75rem)',
                fontWeight: 800,
                color: T.dTextHigh,
                lineHeight: 1.05,
                letterSpacing: '-0.04em',
                mb: '20px',
                whiteSpace: 'pre-line',
              }}
            >
              {isEditMode
                ? 'Refine your\nproject.'
                : 'Build something\nremarkable.'}
            </Typography>

            {/* Sub-copy */}
            <Typography
              sx={{
                fontSize: '0.8125rem',
                color: T.dTextMid,
                lineHeight: 1.8,
                mb: '40px',
                maxWidth: '300px',
                fontWeight: 400,
              }}
            >
              {isEditMode
                ? 'Update your project details to keep your team aligned and rules organized.'
                : 'Projects are the foundation of rule management. Define scope, structure your team, and ship.'}
            </Typography>

            {/* Feature list */}
            <Box>
              {[
                'Organize rules into structured folders',
                'Version control & deployment tracking',
                'Cross-team collaboration & access control',
              ].map((label, i) => (
                <Feature key={label} last={i === 2}>
                  {label}
                </Feature>
              ))}
            </Box>
          </Box>

          {/* Footer */}
          <Typography
            sx={{
              fontSize: '0.625rem',
              color: T.dTextLow,
              fontWeight: 500,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontFamily: '"DM Mono", monospace',
              flexShrink: 0,
              mt: '32px',
            }}
          >
            BRMS Platform · 2025
          </Typography>
        </Box>
      </Box>

      {/* ══════════════════════════════════════════
          RIGHT PANEL — light, focused form
      ══════════════════════════════════════════ */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          overflow: 'auto',
          position: 'relative',
          background: T.bgRight,
          px: { xs: '24px', sm: '48px', lg: '72px' },
        }}
      >
        {/* Mobile back */}
        <Box
          sx={{
            display: { xs: 'flex', lg: 'none' },
            position: 'absolute',
            top: '20px',
            left: '20px',
            zIndex: 2,
          }}
        >
          <Button
            startIcon={<ArrowBackIcon sx={{ fontSize: '12px !important' }} />}
            onClick={() => navigate(`/vertical/${vertical_Key}/dashboard/hub`)}
            disableRipple
            sx={{
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.75rem',
              color: T.indigo,
              px: 0,
              minWidth: 0,
              background: 'none',
              '&:hover': { color: T.indigoHover, background: 'none' },
            }}
          >
            Hub
          </Button>
        </Box>

        {/* Form card */}
        <Box sx={{ width: '100%', maxWidth: '420px', py: '48px' }}>

          {/* Section marker — top-left accent line */}
          <Box
            sx={{
              width: '32px',
              height: '2px',
              borderRadius: '1px',
              background: T.indigo,
              mb: '24px',
              opacity: 0.9,
            }}
          />

          {/* Heading block */}
          <Box sx={{ mb: '32px' }}>
            <Typography
              sx={{
                fontSize: '1.5rem',
                fontWeight: 800,
                color: T.lTextHigh,
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
                mb: '8px',
              }}
            >
              {isEditMode ? 'Edit project' : 'Create project'}
            </Typography>
            <Typography
              sx={{
                fontSize: '0.8125rem',
                color: T.lTextMid,
                fontWeight: 400,
                lineHeight: 1.65,
              }}
            >
              {isEditMode
                ? 'Update the fields below and save your changes.'
                : 'Fill in the details below to set up your new project.'}
            </Typography>
          </Box>

          {/* Error alert */}
          {error && (
            <Alert
              severity="error"
              sx={{
                mb: '24px',
                borderRadius: '6px',
                py: '6px',
                background: T.errorBg,
                border: `1px solid ${T.errorBorder}`,
                color: T.errorText,
                fontSize: '0.8125rem',
                fontWeight: 500,
                '& .MuiAlert-icon': { color: T.errorIcon, fontSize: '1rem' },
              }}
            >
              {error}
            </Alert>
          )}

          {/* Fields */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Project name */}
            <Box>
              <Label required>Project Name</Label>
              <TextField
                fullWidth
                placeholder="e.g. Risk Assessment Engine"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
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
                fullWidth
                multiline
                rows={3}
                placeholder="Briefly describe the purpose and goals of this project…"
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                onFocus={() => setFocused('description')}
                onBlur={() => setFocused(null)}
                sx={inputSx(focused === 'description')}
              />
              <Typography sx={{ mt: '4px', fontSize: '0.6875rem', color: form.description.length > 300 ? '#EF4444' : T.lTextLow, fontFamily: '"DM Mono", monospace', textAlign: 'right' }}>
                {form.description.length}/300
              </Typography>
            </Box>

            {/* Domain */}
            <Box>
              <Label>Domain</Label>
              <TextField
                fullWidth
                placeholder="e.g. finance, healthcare, retail"
                value={form.domain}
                onChange={(e) => handleChange('domain', e.target.value)}
                onFocus={() => setFocused('domain')}
                onBlur={() => setFocused(null)}
                sx={inputSx(focused === 'domain')}
              />
              <Typography
                sx={{
                  mt: '6px',
                  fontSize: '0.6875rem',
                  color: T.lTextLow,
                  lineHeight: 1.55,
                  fontFamily: '"DM Mono", monospace',
                }}
              >
                Categorize within your organization's domain structure.
              </Typography>
            </Box>
          </Box>

          {/* Divider */}
          <Box
            sx={{
              height: '1px',
              bgcolor: T.lBorder,
              mt: '32px',
              mb: '24px',
            }}
          />

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: '10px' }}>
            <Button
              onClick={() => navigate(`/vertical/${vertical_Key}/dashboard/hub`)}
              disableRipple
              sx={{
                borderRadius: '6px',
                py: '10px',
                px: '20px',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.8125rem',
                color: T.lTextMid,
                border: `1px solid ${T.lBorder}`,
                background: '#FFFFFF',
                whiteSpace: 'nowrap',
                letterSpacing: '0.01em',
                '&:hover': {
                  background: '#F1F5F9',
                  borderColor: '#CBD5E1',
                  color: T.lTextHigh,
                },
                transition: 'all 0.15s',
              }}
            >
              Cancel
            </Button>

            <Button
              fullWidth
              disabled={loading}
              onClick={handleSubmit}
              disableRipple
              sx={{
                borderRadius: '6px',
                py: '10px',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.8125rem',
                color: '#FFFFFF',
                letterSpacing: '0.01em',
                background: T.indigo,
                boxShadow: `0 1px 3px rgba(0,0,0,0.12), 0 4px 12px ${T.indigoGlow}`,
                '&:hover': {
                  background: T.indigoHover,
                  boxShadow: `0 1px 3px rgba(0,0,0,0.16), 0 6px 20px rgba(79,70,229,0.28)`,
                  transform: 'translateY(-1px)',
                },
                '&:disabled': {
                  background: '#E2E8F0',
                  color: '#94A3B8',
                  boxShadow: 'none',
                  transform: 'none',
                },
                transition: 'all 0.15s',
              }}
            >
              {loading ? 'Saving…' : isEditMode ? 'Save changes' : 'Create project'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}