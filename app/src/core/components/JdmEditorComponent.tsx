'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import '@gorules/jdm-editor/dist/style.css';
import { JdmEditorProps } from '../types/commonTypes';
import { Box, Button, TextField, Typography, Tabs, Tab, Paper, IconButton, Chip } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ClearIcon from '@mui/icons-material/Clear';
import CodeIcon from '@mui/icons-material/Code';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { brmsTheme } from '../theme/brmsTheme';

// Client-only imports
const DecisionGraph = dynamic(
  () => import('@gorules/jdm-editor').then((mod) => mod.DecisionGraph),
  { ssr: false }
);

const JdmConfigProvider = dynamic(
  () => import('@gorules/jdm-editor').then((mod) => mod.JdmConfigProvider),
  { ssr: false }
);

// Custom Simulator Panel Component
function CustomSimulatorPanel({ onRun, onClear }: { onRun: (context: any) => void; onClear: () => void }) {
  const [context, setContext] = useState('{\n  \n}');
  const [result, setResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = async () => {
    try {
      setIsRunning(true);
      const parsedContext = JSON.parse(context);
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const mockResult = {
        result: parsedContext,
        performance: '1.2ms',
        status: 'success'
      };
      setResult(mockResult);
      setActiveTab(0);
      onRun(parsedContext);
      setIsRunning(false);
    } catch (e) {
      console.error('Invalid JSON:', e);
      setResult({
        error: 'Invalid JSON format',
        message: (e as Error).message,
        status: 'error'
      });
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
        bgcolor: '#fafbfc',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif'
      }}
    >
      {/* Content */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left - Input */}
        <Box sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          borderRight: '1px solid #e1e4e8',
          bgcolor: 'white'
        }}>
          <Box 
            sx={{ 
              px: 2, 
              py: 1.25, 
              bgcolor: '#f6f8fa',
              borderBottom: '1px solid #e1e4e8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              minHeight: 40,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <CodeIcon sx={{ fontSize: 16, color: '#586069' }} />
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  fontWeight: 600,
                  color: '#24292e',
                  fontSize: '0.8125rem',
                  letterSpacing: '-0.01em'
                }}
              >
                Context (JSON)
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Button
                variant="contained"
                size="small"
                onClick={handleRun}
                disabled={isRunning}
                startIcon={<PlayArrowIcon sx={{ fontSize: 14 }} />}
                sx={{
                  bgcolor: brmsTheme.colors.primary,
                  color: brmsTheme.colors.textOnPrimary,
                  fontWeight: 600,
                  textTransform: 'none',
                  px: 1.5,
                  py: 0.25,
                  borderRadius: '4px',
                  boxShadow: brmsTheme.shadows.primarySoft,
                  fontSize: '0.75rem',
                  letterSpacing: '0.02em',
                  minHeight: 26,
                  '&:hover': { 
                    bgcolor: brmsTheme.colors.primaryHover,
                    boxShadow: brmsTheme.shadows.primaryHover,
                  },
                  '&:disabled': {
                    bgcolor: '#b3b9f0',
                    color: 'white',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                {isRunning ? 'Running...' : 'Run'}
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={handleClear}
                startIcon={<ClearIcon sx={{ fontSize: 14 }} />}
                sx={{
                  color: '#586069',
                  borderColor: '#d1d5da',
                  fontWeight: 600,
                  textTransform: 'none',
                  px: 1.5,
                  py: 0.25,
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  letterSpacing: '0.02em',
                  minHeight: 26,
                  '&:hover': { 
                    borderColor: '#b1b5ba', 
                    bgcolor: '#f6f8fa',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                Clear
              </Button>
            </Box>
          </Box>
          <Box sx={{ flex: 1, p: 2 }}>
            <Paper
              elevation={0}
              sx={{
                height: '100%',
                border: '1px solid #e1e4e8',
                borderRadius: '8px',
                overflow: 'hidden',
                '&:focus-within': {
                  borderColor: brmsTheme.colors.primary,
                  boxShadow: '0 0 0 3px rgba(101, 82, 208, 0.1)',
                },
                transition: 'all 0.2s ease',
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
                    fontFamily: '"Fira Code", "Consolas", "Monaco", monospace',
                    fontSize: '0.875rem',
                    lineHeight: 1.6,
                    p: 2,
                    color: '#24292e',
                  },
                  '& textarea': {
                    height: '100% !important',
                    '&::placeholder': {
                      color: '#959da5',
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
          bgcolor: 'white'
        }}>
          <Tabs
            value={activeTab}
            onChange={(e, v) => setActiveTab(v)}
            sx={{
              minHeight: 40,
              borderBottom: '1px solid #e1e4e8',
              bgcolor: '#f6f8fa',
              px: 1.5,
              '& .MuiTabs-indicator': {
                height: 2,
                borderRadius: '2px 2px 0 0',
                background: brmsTheme.gradients.primary,
              },
              '& .MuiTab-root': {
                minHeight: 40,
                textTransform: 'none',
                fontSize: '0.8125rem',
                fontWeight: 600,
                minWidth: 80,
                color: '#586069',
                letterSpacing: '-0.01em',
                py: 0.75,
                '&.Mui-selected': {
                  color: brmsTheme.colors.primary,
                },
                '&:hover': {
                  color: '#24292e',
                  bgcolor: 'rgba(101, 82, 208, 0.05)',
                },
                transition: 'all 0.2s ease',
              }
            }}
          >
            <Tab label="Output" />
            <Tab label="Input" />
            <Tab label="Trace" />
          </Tabs>
          <Box sx={{ flex: 1, p: 2, overflow: 'auto', bgcolor: '#fafbfc' }}>
            {activeTab === 0 && (
              result ? (
                <Paper
                  elevation={0}
                  sx={{
                    fontFamily: '"Fira Code", "Consolas", "Monaco", monospace',
                    fontSize: '0.875rem',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                    bgcolor: result.status === 'error' ? '#fff5f5' : '#f6f8fa',
                    color: result.status === 'error' ? '#d73a49' : '#24292e',
                    p: 2,
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: result.status === 'error' ? '#fdb8c0' : '#e1e4e8',
                    position: 'relative',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  }}
                >
                  {result.status === 'success' && (
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        top: 12, 
                        right: 12,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      <CheckCircleIcon sx={{ fontSize: 16, color: '#28a745' }} />
                      <Chip 
                        label={result.performance} 
                        size="small" 
                        sx={{ 
                          height: 22,
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          bgcolor: '#dcffe4',
                          color: '#28a745',
                          borderRadius: '6px'
                        }} 
                      />
                    </Box>
                  )}
                  <Box sx={{ mt: result.status === 'success' ? 4 : 0 }}>
                    {JSON.stringify(result, null, 2)}
                  </Box>
                </Paper>
              ) : (
                <Box 
                  sx={{ 
                    textAlign: 'center', 
                    py: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1.5
                  }}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      bgcolor: '#f6f8fa',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px dashed #e1e4e8',
                    }}
                  >
                    <PlayArrowIcon sx={{ fontSize: 24, color: '#959da5' }} />
                  </Box>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#586069',
                      fontSize: '0.875rem',
                      fontWeight: 500
                    }}
                  >
                    Click "Run" to execute simulation
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: '#959da5',
                      fontSize: '0.8125rem'
                    }}
                  >
                    Enter your context JSON and run to see results
                  </Typography>
                </Box>
              )
            )}
            {activeTab === 1 && (
              <Paper
                elevation={0}
                sx={{
                  fontFamily: '"Fira Code", "Consolas", "Monaco", monospace',
                  fontSize: '0.875rem',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  bgcolor: '#f6f8fa',
                  color: '#24292e',
                  p: 3,
                  borderRadius: '8px',
                  border: '1px solid #e1e4e8',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                {context}
              </Paper>
            )}
            {activeTab === 2 && (
              <Box 
                sx={{ 
                  textAlign: 'center', 
                  py: 4,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1.5
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    bgcolor: '#f6f8fa',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px dashed #e1e4e8',
                  }}
                >
                  <CodeIcon sx={{ fontSize: 24, color: '#959da5' }} />
                </Box>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#586069',
                    fontSize: '0.875rem',
                    fontWeight: 500
                  }}
                >
                  Run a request to see the node trace in action
                </Typography>
                <Typography 
                  component="a"
                  href="#" 
                  sx={{ 
                    color: '#6552D0',
                    fontSize: '0.8125rem',
                    textDecoration: 'none',
                    fontWeight: 600,
                    '&:hover': {
                      textDecoration: 'underline',
                    }
                  }}
                >
                  Learn more →
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default function JdmEditorComponent({ value, onChange }: JdmEditorProps) {
  const [simulation, setSimulation] = useState<any>();

  const handleSimulationRun = (context: any) => {
    console.log('Running simulation with context:', context);
    // TODO: Call your backend API here
    // const response = await fetch('/api/simulate', {
    //   method: 'POST',
    //   body: JSON.stringify({ context, content: value })
    // });
  };

  const handleSimulationClear = () => {
    setSimulation(undefined);
  };

  return (
    <JdmConfigProvider>
      <div style={{ width: '100%', height: '100%' }}>
        <DecisionGraph 
          value={value} 
          onChange={onChange}
          simulate={simulation}
          panels={[
            {
              id: 'simulator',
              title: 'Simulator',
              icon: <PlayArrowIcon />,
              renderPanel: () => (
                <CustomSimulatorPanel
                  onRun={handleSimulationRun}
                  onClear={handleSimulationClear}
                />
              ),
            },
          ]}
        />
      </div>
    </JdmConfigProvider>
  );
}