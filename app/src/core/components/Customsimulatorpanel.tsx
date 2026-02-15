'use client';

import { useState } from 'react';
import { Box, Button, TextField, Typography, Tabs, Tab, Paper, Chip } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RefreshIcon from '@mui/icons-material/Refresh';
import CodeIcon from '@mui/icons-material/Code';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { JsonObject } from '../types/commonTypes';
import type { ExecuteResponse } from '../../modules/JdmEditorPage/api/executionApi';

interface CustomSimulatorPanelProps {
  onRun: (context: JsonObject) => Promise<ExecuteResponse>;
  onClear: () => void;
}

export default function CustomSimulatorPanel({
  onRun,
  onClear,
}: CustomSimulatorPanelProps) {
  const [context, setContext] = useState('{\n  \n}');
  const [result, setResult] = useState<ExecuteResponse | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = async () => {
    try {
      setIsRunning(true);
      const parsedContext = JSON.parse(context) as JsonObject;
      
      // Call the API through the onRun callback
      const apiResult = await onRun(parsedContext);

      // Set the result from the API, defaulting status to success
      setResult({
        ...apiResult,
        status: apiResult.status ?? 'success',
      });
      setActiveTab(0);
      setIsRunning(false);
    } catch (e) {
      console.error('Error during simulation:', e);
      setResult({
        error: 'Simulation failed',
        message: (e as Error).message,
        status: 'error',
      } as ExecuteResponse);
      setIsRunning(false);
    }
  };

  const handleClear = () => {
    setContext('{\n  \n}');
    setResult(null);
    onClear();
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%', 
        backgroundColor: '#ffffff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 2,
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#ffffff',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontSize: '0.9375rem',
            fontWeight: 600,
            color: '#111827',
            letterSpacing: '-0.01em',
          }}
        >
          Test Simulation
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={handleClear}
            startIcon={<RefreshIcon sx={{ fontSize: 16 }} />}
            sx={{
              height: 32,
              fontSize: '0.8125rem',
              fontWeight: 600,
              textTransform: 'none',
              color: '#6b7280',
              borderColor: '#e5e7eb',
              borderRadius: '6px',
              px: 1.5,
              '&:hover': {
                backgroundColor: '#f9fafb',
                borderColor: '#d1d5db',
              },
            }}
          >
            Reset
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={handleRun}
            disabled={isRunning}
            startIcon={<PlayArrowIcon sx={{ fontSize: 16 }} />}
            sx={{
              height: 32,
              fontSize: '0.8125rem',
              fontWeight: 600,
              textTransform: 'none',
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              borderRadius: '6px',
              px: 2,
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: '#2563eb',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              },
              '&:disabled': {
                backgroundColor: '#e5e7eb',
                color: '#9ca3af',
              },
            }}
          >
            {isRunning ? 'Running...' : 'Run Test'}
          </Button>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left - Input */}
        <Box sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          borderRight: '1px solid #e5e7eb',
        }}>
          <Box 
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 3,
              py: 1.5,
              backgroundColor: '#f9fafb',
              borderBottom: '1px solid #e5e7eb',
            }}
          >
            <CodeIcon sx={{ fontSize: 16, color: '#6b7280' }} />
            <Typography 
              variant="subtitle2" 
              sx={{ 
                fontWeight: 600,
                color: '#374151',
                fontSize: '0.8125rem',
                letterSpacing: '-0.01em',
              }}
            >
              Input Context
            </Typography>
          </Box>
          <Box sx={{ flex: 1, p: 3, overflow: 'hidden' }}>
            <Paper
              elevation={0}
              sx={{
                height: '100%',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                overflow: 'hidden',
                backgroundColor: '#fafafa',
                '&:focus-within': {
                  borderColor: '#3b82f6',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                },
                transition: 'all 0.15s ease',
              }}
            >
              <TextField
                fullWidth
                multiline
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder='{\n  "key": "value"\n}'
                variant="standard"
                InputProps={{
                  disableUnderline: true,
                }}
                sx={{
                  height: '100%',
                  '& .MuiInputBase-root': {
                    height: '100%',
                    alignItems: 'flex-start',
                    fontFamily: '"SF Mono", "Monaco", "Consolas", monospace',
                    fontSize: '0.8125rem',
                    lineHeight: 1.6,
                    p: 2,
                    color: '#111827',
                  },
                  '& textarea': {
                    height: '100% !important',
                    '&::placeholder': {
                      color: '#9ca3af',
                      opacity: 1,
                    }
                  }
                }}
              />
            </Paper>
          </Box>
        </Box>

        {/* Right - Output */}
        <Box sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
        }}>
          <Tabs
            value={activeTab}
            onChange={(e, v) => setActiveTab(v)}
            sx={{
              minHeight: 48,
              borderBottom: '1px solid #e5e7eb',
              backgroundColor: '#f9fafb',
              px: 2,
              '& .MuiTabs-indicator': {
                height: 2,
                borderRadius: '2px 2px 0 0',
                backgroundColor: '#3b82f6',
              },
              '& .MuiTab-root': {
                minHeight: 48,
                textTransform: 'none',
                fontSize: '0.8125rem',
                fontWeight: 600,
                minWidth: 90,
                color: '#6b7280',
                letterSpacing: '-0.01em',
                px: 2,
                '&.Mui-selected': {
                  color: '#111827',
                },
                '&:hover': {
                  color: '#374151',
                },
              }
            }}
          >
            <Tab 
              label="Output" 
              icon={<AssessmentIcon sx={{ fontSize: 16, mb: 0.5 }} />}
              iconPosition="start"
            />
            <Tab 
              label="Input Echo" 
              icon={<CodeIcon sx={{ fontSize: 16, mb: 0.5 }} />}
              iconPosition="start"
            />
          </Tabs>
          <Box sx={{ flex: 1, p: 3, overflow: 'auto', backgroundColor: '#fafafa' }}>
            {activeTab === 0 && (
              result ? (
                <Paper
                  elevation={0}
                  sx={{
                    fontFamily: '"SF Mono", "Monaco", "Consolas", monospace',
                    fontSize: '0.8125rem',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                    backgroundColor: result.status === 'error' ? '#fef2f2' : '#f9fafb',
                    color: result.status === 'error' ? '#991b1b' : '#111827',
                    p: 2.5,
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: result.status === 'error' ? '#fecaca' : '#e5e7eb',
                    position: 'relative',
                  }}
                >
                  {/* Status Badge */}
                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      top: 16, 
                      right: 16,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                    }}
                  >
                    {result.status === 'success' ? (
                      <>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CheckCircleOutlineIcon sx={{ fontSize: 16, color: '#059669' }} />
                          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#059669' }}>
                            Success
                          </Typography>
                        </Box>
                        {result.performance && (
                          <Chip 
                            label={result.performance} 
                            size="small" 
                            sx={{ 
                              height: 24,
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              backgroundColor: '#d1fae5',
                              color: '#065f46',
                              borderRadius: '6px',
                              '& .MuiChip-label': {
                                px: 1.5,
                              }
                            }} 
                          />
                        )}
                      </>
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <ErrorOutlineIcon sx={{ fontSize: 16, color: '#dc2626' }} />
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#dc2626' }}>
                          Error
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  <Box sx={{ mt: result.status === 'success' ? 5 : 0 }}>
                    {JSON.stringify(result, null, 2)}
                  </Box>
                </Paper>
              ) : (
                <Box 
                  sx={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    gap: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: '12px',
                      backgroundColor: '#f3f4f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <PlayArrowIcon sx={{ fontSize: 28, color: '#9ca3af' }} />
                  </Box>
                  <Typography
                    sx={{
                      color: '#111827',
                      fontSize: '0.9375rem',
                      fontWeight: 600,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    Ready to test
                  </Typography>
                  <Typography 
                    sx={{ 
                      color: '#6b7280',
                      fontSize: '0.8125rem',
                      textAlign: 'center',
                      maxWidth: 280,
                      lineHeight: 1.5,
                    }}
                  >
                    Enter your test context in JSON format and click Run Test to see results
                  </Typography>
                </Box>
              )
            )}
            {activeTab === 1 && (
              <Paper
                elevation={0}
                sx={{
                  fontFamily: '"SF Mono", "Monaco", "Consolas", monospace',
                  fontSize: '0.8125rem',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  backgroundColor: '#f9fafb',
                  color: '#111827',
                  p: 2.5,
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                }}
              >
                {context}
              </Paper>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}