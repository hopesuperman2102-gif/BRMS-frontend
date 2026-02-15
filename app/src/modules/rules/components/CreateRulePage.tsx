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
import { rulesApi } from 'app/src/modules/rules/api/rulesApi';

type FormState = {
  name: string;
  description: string;
};

type ApiRule = {
  rule_key: string;
  name: string;
  description?: string;
  status: string;
  created_at: string;
};

export default function CreateRulePage() {
  const navigate = useNavigate();
  const { verticalId } = useParams(); 
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
        const rules = (await rulesApi.getProjectRules(project_key)) as ApiRule[];
        const rule = rules.find((r) => r.rule_key === ruleKey);

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

      //  Duplicate name check
      const existingRules = (await rulesApi.getProjectRules(project_key!)) as ApiRule[];

      const duplicate = existingRules.some(
        (r) =>
          r.name.toLowerCase().trim() === form.name.toLowerCase().trim() &&
          r.rule_key !== ruleKey
      );

      if (duplicate) {
        setError('Rule name already exists');
        setLoading(false);
        return;
      }

      //  Edit
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

      navigate(`/vertical/${verticalId}/dashboard/hub/${project_key}/rules`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
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
            {isEditMode ? 'Edit Rule' : 'Create New Rule'}
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
              ? 'Update your rule information below' 
              : 'Fill in the details to create a new rule'}
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
                Rule Name
                <Box component="span" sx={{ color: '#DC2626' }}>*</Box>
              </Typography>
              <TextField
                fullWidth
                required
                placeholder="Enter rule name"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
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
                placeholder="Describe your rule (optional)"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
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
              onClick={() =>
                navigate(`/vertical/${verticalId}/dashboard/hub/${project_key}/rules`)
              }
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
                ? 'Update Rule'
                : 'Create Rule'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}