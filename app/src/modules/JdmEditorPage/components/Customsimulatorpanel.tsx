'use client';

import { useState } from 'react';
import { Box, Button, TextField, Typography, Tabs, Tab, Paper, Chip } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RefreshIcon from '@mui/icons-material/Refresh';
import CodeIcon from '@mui/icons-material/Code';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { CustomSimulatorPanelProps, ExecuteResponse, JsonObject } from 'app/src/modules/JdmEditorPage/types/JdmEditorTypes';
import { brmsTheme } from 'app/src/core/theme/brmsTheme';


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
        backgroundColor: brmsTheme.colors.white,
        fontFamily: brmsTheme.fonts.sans
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
          borderBottom: `1px solid ${brmsTheme.colors.lightBorder}`,
          backgroundColor: brmsTheme.colors.white,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontSize: '0.9375rem',
            fontWeight: 600,
            color: brmsTheme.colors.textDark,
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
              color: brmsTheme.colors.textGray,
              borderColor: brmsTheme.colors.lightBorder,
              borderRadius: '6px',
              px: 1.5,
              '&:hover': {
                backgroundColor: brmsTheme.colors.bgGrayLight,
                borderColor: brmsTheme.colors.lightBorderHover,
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
              backgroundColor: brmsTheme.colors.primary,
              color: brmsTheme.colors.textOnPrimary,
              borderRadius: '6px',
              px: 2,
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: brmsTheme.colors.primary,
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              },
              '&:disabled': {
                backgroundColor: brmsTheme.colors.lightBorder,
                color: brmsTheme.colors.textGrayLight,
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
          borderRight: `1px solid ${brmsTheme.colors.lightBorder}`,
        }}>
          <Box 
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 3,
              py: 1.5,
              backgroundColor: brmsTheme.colors.bgGrayLight,
              borderBottom: `1px solid ${brmsTheme.colors.lightBorder}`,
            }}
          >
            <CodeIcon sx={{ fontSize: 16, color: brmsTheme.colors.textGray }} />
            <Typography 
              variant="subtitle2" 
              sx={{ 
                fontWeight: 600,
                color: brmsTheme.colors.navTextHigh,
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
                border: `1px solid ${brmsTheme.colors.lightBorder}`,
                borderRadius: '8px',
                overflow: 'hidden',
                backgroundColor: brmsTheme.colors.surfaceBase,
                '&:focus-within': {
                  borderColor: brmsTheme.colors.focusBlue,
                  backgroundColor: brmsTheme.colors.white,
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
                    fontFamily: brmsTheme.fonts.mono,
                    fontSize: '0.8125rem',
                    lineHeight: 1.6,
                    p: 2,
                    color: brmsTheme.colors.textDark,
                  },
                  '& textarea': {
                    height: '100% !important',
                    '&::placeholder': {
                      color: brmsTheme.colors.textGrayLight,
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
              borderBottom: `1px solid ${brmsTheme.colors.lightBorder}`,
              backgroundColor: brmsTheme.colors.bgGrayLight,
              px: 2,
              '& .MuiTabs-indicator': {
                height: 2,
                borderRadius: '2px 2px 0 0',
                backgroundColor: brmsTheme.colors.focusBlue,
              },
              '& .MuiTab-root': {
                minHeight: 48,
                textTransform: 'none',
                fontSize: '0.8125rem',
                fontWeight: 600,
                minWidth: 90,
                color: brmsTheme.colors.textGray,
                letterSpacing: '-0.01em',
                px: 2,
                '&.Mui-selected': {
                  color: brmsTheme.colors.textDark,
                },
                '&:hover': {
                  color: brmsTheme.colors.navTextHigh,
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
          <Box sx={{ flex: 1, p: 3, overflow: 'auto', backgroundColor: brmsTheme.colors.surfaceBase }}>
            {activeTab === 0 && (
              result ? (
                <Paper
                  elevation={0}
                  sx={{
                    fontFamily: brmsTheme.fonts.mono,
                    fontSize: '0.8125rem',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                    backgroundColor: result.status === 'error' ? brmsTheme.colors.errorBg : brmsTheme.colors.bgGrayLight,
                    color: result.status === 'error' ? brmsTheme.colors.statusDeprecatedText : brmsTheme.colors.textDark,
                    p: 2.5,
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: result.status === 'error' ? brmsTheme.colors.errorBorder : brmsTheme.colors.lightBorder,
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
                          <CheckCircleOutlineIcon sx={{ fontSize: 16, color: brmsTheme.colors.success }} />
                          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: brmsTheme.colors.success }}>
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
                              backgroundColor: brmsTheme.colors.approvedBg,
                              color: brmsTheme.colors.approvedText,
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
                        <ErrorOutlineIcon sx={{ fontSize: 16, color: brmsTheme.colors.deleteRed }} />
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: brmsTheme.colors.deleteRed }}>
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
                      backgroundColor: brmsTheme.colors.bgGray,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <PlayArrowIcon sx={{ fontSize: 28, color: brmsTheme.colors.textGrayLight }} />
                  </Box>
                  <Typography
                    sx={{
                      color: brmsTheme.colors.textDark,
                      fontSize: '0.9375rem',
                      fontWeight: 600,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    Ready to test
                  </Typography>
                  <Typography 
                    sx={{ 
                      color: brmsTheme.colors.textGray,
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
                  fontFamily: brmsTheme.fonts.mono,
                  fontSize: '0.8125rem',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  backgroundColor: brmsTheme.colors.bgGrayLight,
                  color: brmsTheme.colors.textDark,
                  p: 2.5,
                  borderRadius: '8px',
                  border: `1px solid ${brmsTheme.colors.lightBorder}`,
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
