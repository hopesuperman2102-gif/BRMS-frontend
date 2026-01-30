'use client';

import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import '@gorules/jdm-editor/dist/style.css';
import {
  Box,
  Button,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Divider,
  TextField,
  Tooltip,
  Paper,
  Collapse,
  Alert,
} from '@mui/material';

// Type declarations for File System Access API
declare global {
  interface FileSystemWritableFileStream extends WritableStream {
    write(data: string | BufferSource | Blob): Promise<void>;
    close(): Promise<void>;
  }

  interface FileSystemFileHandle {
    getFile(): Promise<File>;
    createWritable(): Promise<FileSystemWritableFileStream>;
    readonly kind: 'file';
    readonly name: string;
  }

  interface Window {
    showOpenFilePicker(options?: {
      types?: Array<{ accept: Record<string, string[]> }>;
    }): Promise<FileSystemFileHandle[]>;
    showSaveFilePicker(options?: {
      types?: Array<{ description?: string; accept: Record<string, string[]> }>;
    }): Promise<FileSystemFileHandle>;
  }
}

// Dynamic imports for client-only components
const DecisionGraph = dynamic(
  () => import('@gorules/jdm-editor').then((mod) => mod.DecisionGraph),
  { ssr: false }
);

interface DecisionGraphType {
  nodes: any[];
  edges: any[];
}

interface EnhancedJdmEditorProps {
  value?: DecisionGraphType;
  onChange?: (value: DecisionGraphType) => void;
  fileName?: string;
  onFileNameChange?: (name: string) => void;
}

enum ThemePreference {
  Automatic = 'automatic',
  Light = 'light',
  Dark = 'dark',
}

enum DocumentFileTypes {
  Decision = 'application/vnd.gorules.decision',
}

const supportFSApi = typeof window !== 'undefined' && 'showSaveFilePicker' in window;

// Simple icon components using Unicode symbols
const Icon = ({ children, ...props }: any) => (
  <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', fontSize: '1.2rem' }} {...props}>
    {children}
  </Box>
);

export default function EnhancedJdmEditor({
  value = { nodes: [], edges: [] },
  onChange,
  fileName: initialFileName = 'Untitled Decision',
  onFileNameChange,
}: EnhancedJdmEditorProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const graphRef = useRef<any>(null);
  const [themePreference, setThemePreference] = useState<ThemePreference>(ThemePreference.Automatic);
  const [fileHandle, setFileHandle] = useState<FileSystemFileHandle | undefined>();
  const [graph, setGraph] = useState<DecisionGraphType>(value);
  const [fileName, setFileName] = useState(initialFileName);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempFileName, setTempFileName] = useState(fileName);
  
  // Menu states
  const [openMenuAnchor, setOpenMenuAnchor] = useState<null | HTMLElement>(null);
  const [themeMenuAnchor, setThemeMenuAnchor] = useState<null | HTMLElement>(null);
  
  // Dialog states
  const [newDialogOpen, setNewDialogOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Simulator states
  const [showSimulator, setShowSimulator] = useState(true);
  const [simulatorContext, setSimulatorContext] = useState('{\n  \n}');
  const [simulatorResult, setSimulatorResult] = useState<any>(null);
  const [simulatorError, setSimulatorError] = useState<string>('');

  useEffect(() => {
    setGraph(value);
  }, [value]);

  const handleGraphChange = (newValue: DecisionGraphType) => {
    setGraph(newValue);
    onChange?.(newValue);
  };

  const handleFileNameBlur = () => {
    setIsEditingName(false);
    const trimmed = tempFileName.trim();
    if (trimmed) {
      setFileName(trimmed);
      onFileNameChange?.(trimmed);
    } else {
      setTempFileName(fileName);
    }
  };

  const handleNew = () => {
    setNewDialogOpen(true);
  };

  const confirmNew = () => {
    setGraph({ nodes: [], edges: [] });
    onChange?.({ nodes: [], edges: [] });
    setFileName('Untitled Decision');
    onFileNameChange?.('Untitled Decision');
    setNewDialogOpen(false);
    showSnackbar('New decision created');
  };

  const openFile = async () => {
    if (!supportFSApi) {
      fileInput.current?.click?.();
      return;
    }

    try {
      const [handle] = await window.showOpenFilePicker({
        types: [{ accept: { 'application/json': ['.json'] } }],
      });

      setFileHandle(handle);

      const file = await handle.getFile();
      const content = await file.text();
      setFileName(file?.name);
      onFileNameChange?.(file?.name);
      const parsed = JSON.parse(content);
      const newGraph = {
        nodes: parsed?.nodes || [],
        edges: parsed?.edges || [],
      };
      setGraph(newGraph);
      onChange?.(newGraph);
      showSnackbar('File opened successfully');
    } catch (err) {
      console.error('Error opening file:', err);
      showSnackbar('Error opening file');
    }
  };

  const saveFile = async () => {
    if (!supportFSApi) {
      showSnackbar('File system API not supported');
      return;
    }

    if (fileHandle) {
      let writable: FileSystemWritableFileStream | undefined = undefined;
      try {
        writable = await fileHandle.createWritable();
        const json = JSON.stringify({ contentType: DocumentFileTypes.Decision, ...graph }, null, 2);
        await writable.write(json);
        showSnackbar('File saved successfully');
      } catch (e) {
        console.error('Error saving file:', e);
        showSnackbar('Error saving file');
      } finally {
        await writable?.close?.();
      }
    }
  };

  const saveFileAs = async () => {
    if (!supportFSApi) {
      return await handleDownload();
    }

    let writable: FileSystemWritableFileStream | undefined = undefined;
    try {
      const json = JSON.stringify({ contentType: DocumentFileTypes.Decision, ...graph }, null, 2);
      const newFileName = `${fileName.replaceAll('.json', '')}.json`;
      const handle = await window.showSaveFilePicker({
        types: [{ description: newFileName, accept: { 'application/json': ['.json'] } }],
      });

      writable = await handle.createWritable();
      await writable.write(json);
      setFileHandle(handle);
      const file = await handle.getFile();
      setFileName(file.name);
      onFileNameChange?.(file.name);
      showSnackbar('File saved successfully');
    } catch (e) {
      console.error('Error saving file:', e);
      showSnackbar('Error saving file');
    } finally {
      await writable?.close?.();
    }
  };

  const handleDownload = async () => {
    try {
      const newFileName = `${fileName.replaceAll('.json', '')}.json`;
      const json = JSON.stringify({ contentType: DocumentFileTypes.Decision, ...graph }, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const href = URL.createObjectURL(blob);

      const link = window.document.createElement('a');
      link.href = href;
      link.download = newFileName;
      window.document.body.appendChild(link);
      link.click();

      window.document.body.removeChild(link);
      URL.revokeObjectURL(href);
      showSnackbar('File downloaded');
    } catch (e) {
      console.error('Error downloading file:', e);
      showSnackbar('Error downloading file');
    }
  };

  const handleUploadInput = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event?.target?.files as FileList;
    if (!fileList || fileList.length === 0) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e?.target?.result as string);
        if (parsed?.contentType !== DocumentFileTypes.Decision) {
          throw new Error('Invalid content type');
        }

        const nodes: any[] = parsed.nodes || [];
        const nodeIds = nodes.map((node) => node.id);
        const edges: any[] = ((parsed.edges || []) as any[]).filter(
          (edge: any) => nodeIds.includes(edge?.targetId) && nodeIds.includes(edge?.sourceId)
        );

        const newGraph = { edges, nodes };
        setGraph(newGraph);
        onChange?.(newGraph);
        setFileName(fileList?.[0]?.name);
        onFileNameChange?.(fileList?.[0]?.name);
        showSnackbar('File loaded successfully');
      } catch (e) {
        console.error('Error loading file:', e);
        showSnackbar('Error loading file');
      }
    };

    reader.readAsText(Array.from(fileList)?.[0], 'UTF-8');
  };

  const handleRunSimulation = async () => {
    setSimulatorError('');
    setSimulatorResult(null);

    try {
      // Parse the context
      const context = JSON.parse(simulatorContext);

      // Here you would call your backend simulation API
      // For now, we'll show a mock result
      const mockResult = {
        result: context,
        performance: '1.2ms',
        trace: [
          { nodeId: 'input', nodeName: 'Input', status: 'success' },
          { nodeId: 'decision', nodeName: 'Decision Table', status: 'success' },
          { nodeId: 'output', nodeName: 'Output', status: 'success' },
        ],
      };

      setSimulatorResult(mockResult);
      showSnackbar('Simulation completed');

      // TODO: Replace with actual API call
      // const response = await fetch('/api/simulate', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ context, content: graph }),
      // });
      // const result = await response.json();
      // setSimulatorResult(result);
    } catch (e: any) {
      setSimulatorError(e.message || 'Simulation failed');
      showSnackbar('Simulation error');
    }
  };

  const handleClearSimulation = () => {
    setSimulatorResult(null);
    setSimulatorError('');
    setSimulatorContext('{\n  \n}');
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setTimeout(() => setSnackbarMessage(''), 3000);
  };

  return (
    <>
      <input
        hidden
        accept="application/json"
        type="file"
        ref={fileInput}
        onChange={handleUploadInput}
        onClick={(event) => {
          const target = event.target as HTMLInputElement;
          target.value = '';
        }}
      />

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          width: '100%',
          bgcolor: '#f5f5f5',
        }}
      >
        {/* Toolbar */}
        <Paper
          elevation={0}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 1,
            py: 0.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              size="small"
              href="https://gorules.io"
              target="_blank"
              sx={{ p: 0.5 }}
            >
              <Box
                component="span"
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: 'primary.main',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.7rem',
                }}
              >
                JDM
              </Box>
            </IconButton>

            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {isEditingName ? (
                <TextField
                  size="small"
                  value={tempFileName}
                  onChange={(e) => setTempFileName(e.target.value)}
                  onBlur={handleFileNameBlur}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleFileNameBlur();
                    }
                  }}
                  autoFocus
                  sx={{ width: 200 }}
                  inputProps={{ maxLength: 24 }}
                />
              ) : (
                <Typography
                  variant="h6"
                  onClick={() => {
                    setIsEditingName(true);
                    setTempFileName(fileName);
                  }}
                  sx={{
                    cursor: 'pointer',
                    fontWeight: 400,
                    fontSize: '1.1rem',
                    '&:hover': { bgcolor: 'action.hover' },
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                  }}
                >
                  {fileName}
                </Typography>
              )}

              <Tooltip title="New Decision">
                <Button
                  size="small"
                  variant="text"
                  onClick={handleNew}
                  startIcon={<Icon>📄</Icon>}
                >
                  New
                </Button>
              </Tooltip>

              <Tooltip title="Open File">
                <Button
                  size="small"
                  variant="text"
                  onClick={(e) => setOpenMenuAnchor(e.currentTarget)}
                  startIcon={<Icon>📂</Icon>}
                >
                  Open
                </Button>
              </Tooltip>
              <Menu
                anchorEl={openMenuAnchor}
                open={Boolean(openMenuAnchor)}
                onClose={() => setOpenMenuAnchor(null)}
              >
                <MenuItem onClick={() => { openFile(); setOpenMenuAnchor(null); }}>
                  File system
                </MenuItem>
              </Menu>

              {supportFSApi && (
                <Tooltip title="Save">
                  <Button
                    size="small"
                    variant="text"
                    onClick={saveFile}
                    startIcon={<Icon>💾</Icon>}
                  >
                    Save
                  </Button>
                </Tooltip>
              )}

              <Tooltip title="Save As">
                <Button
                  size="small"
                  variant="text"
                  onClick={saveFileAs}
                  startIcon={<Icon>📥</Icon>}
                >
                  Save as
                </Button>
              </Tooltip>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Toggle Simulator">
              <Button
                size="small"
                variant={showSimulator ? 'contained' : 'outlined'}
                onClick={() => setShowSimulator(!showSimulator)}
                startIcon={<Icon>▶️</Icon>}
              >
                Simulator
              </Button>
            </Tooltip>

            <Tooltip title="Theme">
              <IconButton
                size="small"
                onClick={(e) => setThemeMenuAnchor(e.currentTarget)}
              >
                <Icon>💡</Icon>
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={themeMenuAnchor}
              open={Boolean(themeMenuAnchor)}
              onClose={() => setThemeMenuAnchor(null)}
            >
              <MenuItem
                onClick={() => {
                  setThemePreference(ThemePreference.Automatic);
                  setThemeMenuAnchor(null);
                }}
              >
                {themePreference === ThemePreference.Automatic && <Icon sx={{ mr: 1 }}>✓</Icon>}
                {themePreference !== ThemePreference.Automatic && <Box sx={{ width: 24, mr: 1 }} />}
                Automatic
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setThemePreference(ThemePreference.Dark);
                  setThemeMenuAnchor(null);
                }}
              >
                {themePreference === ThemePreference.Dark && <Icon sx={{ mr: 1 }}>✓</Icon>}
                {themePreference !== ThemePreference.Dark && <Box sx={{ width: 24, mr: 1 }} />}
                Dark
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setThemePreference(ThemePreference.Light);
                  setThemeMenuAnchor(null);
                }}
              >
                {themePreference === ThemePreference.Light && <Icon sx={{ mr: 1 }}>✓</Icon>}
                {themePreference !== ThemePreference.Light && <Box sx={{ width: 24, mr: 1 }} />}
                Light
              </MenuItem>
            </Menu>
          </Box>
        </Paper>

        {/* Main Content Area */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Editor Content */}
          <Box sx={{ flex: showSimulator ? '1 1 60%' : '1', overflow: 'hidden', position: 'relative' }}>
            <DecisionGraph
              ref={graphRef}
              value={graph}
              onChange={handleGraphChange}
            />
          </Box>

          {/* Simulator Panel */}
          <Collapse in={showSimulator} timeout={300}>
            <Paper
              elevation={3}
              sx={{
                height: 250,
                borderTop: '2px solid',
                borderColor: 'primary.main',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              {/* Simulator Header */}
              <Box
                sx={{
                  px: 2,
                  py: 1,
                  bgcolor: 'primary.main',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 500 }}>
                  ▶️ Simulator
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    variant="contained"
                    color="success"
                    onClick={handleRunSimulation}
                    sx={{ color: 'white' }}
                  >
                    Run
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={handleClearSimulation}
                    sx={{ color: 'white', borderColor: 'white' }}
                  >
                    Clear
                  </Button>
                </Box>
              </Box>

              {/* Simulator Content */}
              <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* Input Section */}
                <Box sx={{ flex: 1, p: 2, borderRight: '1px solid', borderColor: 'divider', overflow: 'auto' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Context (JSON)
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={6}
                    value={simulatorContext}
                    onChange={(e) => setSimulatorContext(e.target.value)}
                    placeholder='{\n  "key": "value"\n}'
                    variant="outlined"
                    size="small"
                    sx={{
                      '& .MuiInputBase-root': {
                        fontFamily: 'monospace',
                        fontSize: '0.875rem',
                      },
                    }}
                  />
                </Box>

                {/* Output Section */}
                <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Result
                  </Typography>
                  {simulatorError && (
                    <Alert severity="error" sx={{ mb: 1 }}>
                      {simulatorError}
                    </Alert>
                  )}
                  {simulatorResult ? (
                    <Box
                      sx={{
                        bgcolor: 'grey.100',
                        p: 1.5,
                        borderRadius: 1,
                        fontFamily: 'monospace',
                        fontSize: '0.875rem',
                        overflow: 'auto',
                        maxHeight: 150,
                      }}
                    >
                      <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                        {JSON.stringify(simulatorResult, null, 2)}
                      </pre>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Click "Run" to execute simulation
                    </Typography>
                  )}
                </Box>
              </Box>
            </Paper>
          </Collapse>
        </Box>

        {/* Snackbar */}
        {snackbarMessage && (
          <Paper
            elevation={6}
            sx={{
              position: 'absolute',
              bottom: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              px: 2,
              py: 1,
              bgcolor: 'grey.800',
              color: 'white',
              zIndex: 9999,
            }}
          >
            <Typography variant="body2">{snackbarMessage}</Typography>
          </Paper>
        )}
      </Box>

      {/* New Decision Dialog */}
      <Dialog open={newDialogOpen} onClose={() => setNewDialogOpen(false)}>
        <DialogTitle>New decision</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to create new blank decision, your current work might be lost?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmNew} variant="contained" color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}