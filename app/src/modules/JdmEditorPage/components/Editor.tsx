'use client';

import { useEffect, useState } from 'react';
import { Box, Select, MenuItem, Button, FormControl, Typography, Divider } from '@mui/material';
import { RepoItem, JsonObject } from '../../../core/types/commonTypes';
import type { DecisionGraphType } from '@gorules/jdm-editor';
import type { ExecuteResponse } from 'app/src/modules/JdmEditorPage/api/executionApi';
import { EditorProps } from '../types/JdmEditorTypes';
import JdmEditorComponent from '../../../core/components/JdmEditorComponent';
import { ruleVersionsApi, RuleVersion } from 'app/src/modules/JdmEditorPage/api/ruleVersionsApi';
import { useAlertStore } from '../../../core/components/Alert';
import SaveIcon from '@mui/icons-material/Save';
import HistoryIcon from '@mui/icons-material/History';

interface EditorPropsExtended extends EditorProps {
  onSimulatorRun: (jdm: DecisionGraphType, context: JsonObject) => Promise<ExecuteResponse>;
}

const EMPTY_GRAPH: DecisionGraphType = {
  nodes: [],
  edges: [],
};

export default function Editor({
  items,
  selectedId,
  onSimulatorRun,
}: EditorPropsExtended) {
  const [selectedVersion, setSelectedVersion] = useState('');
  const [versions, setVersions] = useState<RuleVersion[]>([]);
  const [currentGraph, setCurrentGraph] = useState<DecisionGraphType | null>(null);
  const [isVersionsLoading, setIsVersionsLoading] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);
  const { showAlert } = useAlertStore();

  const findItem = (list: RepoItem[], id: number): RepoItem | null => {
    for (const i of list) {
      if (i.id === id) return i;
      if (i.children) {
        const f = findItem(i.children, id);
        if (f) return f;
      }
    }
    return null;
  };

  const selectedItem = selectedId ? findItem(items, selectedId) : null;
  const selectedItemId = selectedItem?.id;

  // Fetch versions ONLY when a specific rule is selected
  useEffect(() => {
    if (!selectedItemId) {
      setVersions([]);
      setSelectedVersion('');
      setCurrentGraph(null);
      return;
    }

    const fetchVersionsForSelectedRule = async () => {
      setIsVersionsLoading(true);
      try {
        console.log(`Fetching versions for rule: ${selectedItemId}`);
        
        // Only call list API once for THIS rule only
        const versionsList = await ruleVersionsApi.listVersions(String(selectedItemId));

        if (versionsList && versionsList.length > 0) {
          console.log(`Found ${versionsList.length} versions for rule ${selectedItemId}`);
          setVersions(versionsList);
          
          // Set the latest version (first in array) as selected
          const latestVersion = versionsList[0];
          setSelectedVersion(latestVersion.version);
          
          // Load the graph for the latest version
          if (latestVersion.jdm) {
            setCurrentGraph(latestVersion.jdm);
          } else {
            // If no JDM in the version list response, fetch it
            try {
              const versionData = await ruleVersionsApi.getVersionData(
                String(selectedItemId),
                latestVersion.version
              );
              setCurrentGraph(versionData.jdm ?? null);
            } catch (error) {
              console.error('Error loading version data:', error);
              setCurrentGraph(null);
            }
          }
        } else {
          // No versions exist for this rule
          console.log(`No versions found for rule ${selectedItemId}`);
          setVersions([]);
          setSelectedVersion('');
          // Show an empty editor so user can start drawing immediately
          setCurrentGraph(EMPTY_GRAPH);
        }
      } catch (error) {
        console.error('Error fetching versions:', error);
        showAlert('Error fetching versions', 'error');
        // If API fails, show empty editor so user can still work
        setVersions([]);
        setSelectedVersion('');
        setCurrentGraph(EMPTY_GRAPH);
      } finally {
        setIsVersionsLoading(false);
      }
    };

    fetchVersionsForSelectedRule();
  }, [selectedItemId, showAlert]); // Only trigger when selected rule changes

  // Handle version change in dropdown
  const handleVersionChange = async (version: string) => {
    if (!selectedItem) return;
    
    setSelectedVersion(version);
    
    // Check if JDM is already in the versions list
    const versionObj = versions.find((v) => v.version === version);
    if (versionObj && versionObj.jdm) {
      setCurrentGraph(versionObj.jdm);
      return;
    }
    
    // Otherwise fetch it
    try {
      const versionData = await ruleVersionsApi.getVersionData(
        String(selectedItem.id),
        version
      );
      if (versionData && versionData.jdm) {
        setCurrentGraph(versionData.jdm);
      }
    } catch (error) {
      console.error('Error loading version data:', error);
      showAlert('Failed to load version data', 'error');
    }
  };

  const handleGraphChange = (value: DecisionGraphType) => {
    setCurrentGraph(value);
  };

  const handleCommit = async () => {
    if (!selectedItem || !currentGraph) {
      console.error('No item selected or no graph data');
      showAlert('No item selected or no graph data', 'error');
      return;
    }

    setIsCommitting(true);
    try {
      console.log(`Committing changes for rule: ${selectedItem.id}`);
      
      // Create new version
      await ruleVersionsApi.createVersion({
        rule_key: String(selectedItem.id),
        jdm: currentGraph,
      });

      console.log('Version created successfully');
      
      // Refresh versions list to get the newly created version
      const updatedVersions = await ruleVersionsApi.listVersions(String(selectedItem.id));

      if (updatedVersions && updatedVersions.length > 0) {
        setVersions(updatedVersions);
        // Set the latest version as selected (first item in array)
        const latestVersion = updatedVersions[0];
        setSelectedVersion(latestVersion.version);
        
        console.log(`New version created: ${latestVersion.version}`);
        
        showAlert(`Changes committed successfully! New version: ${latestVersion.version}`, 'success');
      } else {
        showAlert('Changes committed successfully!', 'success');
      }
    } catch (error) {
      console.error('Error committing changes:', error);
      showAlert('Failed to commit changes. Please try again.', 'error');
    } finally {
      setIsCommitting(false);
    }
  };

  const isDropdownDisabled = versions.length === 0;

  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        overflow: 'hidden',
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header Bar - Enterprise Clean */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 3,
          py: 2,
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e5e7eb',
          flexShrink: 0,
          minHeight: 64,
        }}
      >
        {/* Left - Rule Name */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600,
              color: '#111827',
              fontSize: '1rem',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              letterSpacing: '-0.01em',
            }}
          >
            {selectedItem ? selectedItem.name : 'Select a rule to begin'}
          </Typography>
        </Box>

        {/* Right - Version Control */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Version Selector */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <HistoryIcon sx={{ fontSize: 18, color: '#6b7280' }} />
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <Select
                value={selectedVersion}
                onChange={(e) => handleVersionChange(e.target.value)}
                disabled={isDropdownDisabled || isVersionsLoading}
                displayEmpty
                sx={{
                  height: 36,
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#374151',
                  '& .MuiOutlinedInput-notchedOutline': {
                    border: 'none',
                  },
                  '&:hover': {
                    backgroundColor: '#f3f4f6',
                    borderColor: '#d1d5db',
                  },
                  '&.Mui-focused': {
                    backgroundColor: '#ffffff',
                    borderColor: '#3b82f6',
                    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                  },
                  '&.Mui-disabled': {
                    backgroundColor: '#f9fafb',
                    color: '#9ca3af',
                  },
                  transition: 'all 0.15s ease',
                }}
              >
                {versions.length === 0 ? (
                  <MenuItem value="" disabled>
                    {isVersionsLoading ? 'Loading versions...' : 'No versions available'}
                  </MenuItem>
                ) : (
                  versions.map((version) => (
                    <MenuItem 
                      key={version.version} 
                      value={version.version}
                      sx={{
                        fontSize: '0.875rem',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                        fontWeight: 500,
                        py: 1,
                      }}
                    >
                      {version.version}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Box>

          <Divider orientation="vertical" flexItem sx={{ my: 0.5, backgroundColor: '#e5e7eb' }} />

          {/* Commit Button */}
          <Button
            variant="contained"
            onClick={handleCommit}
            disabled={!selectedItem || !currentGraph || isCommitting}
            startIcon={<SaveIcon sx={{ fontSize: 18 }} />}
            sx={{
              height: 36,
              backgroundColor: '#6552D0',
              color: '#ffffff',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontSize: '0.875rem',
              fontWeight: 600,
              textTransform: 'none',
              px: 2.5,
              borderRadius: '6px',
              boxShadow: 'none',
              letterSpacing: '-0.01em',
              '&:hover': {
                backgroundColor: '#2563eb',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
              },
              '&:active': {
                backgroundColor: '#1d4ed8',
              },
              '&:disabled': {
                backgroundColor: '#e5e7eb',
                color: '#9ca3af',
              },
              transition: 'all 0.15s ease',
            }}
          >
            {isCommitting ? 'Saving...' : 'Commit Changes'}
          </Button>
        </Box>
      </Box>

      {/* Editor Content Area */}
      <Box sx={{ flex: 1, overflow: 'hidden', backgroundColor: '#fafafa' }}>
        {selectedId && selectedItem?.type === 'file' ? (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {isVersionsLoading ? (
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    border: '3px solid #e5e7eb',
                    borderTopColor: '#3b82f6',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                    '@keyframes spin': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' },
                    },
                  }}
                />
                <Typography 
                  sx={{ 
                    color: '#6b7280',
                    fontSize: '0.875rem',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    fontWeight: 500,
                  }}
                >
                  Loading versions...
                </Typography>
              </Box>
            ) : currentGraph !== null ? (
              <JdmEditorComponent
                value={currentGraph}
                onChange={handleGraphChange}
                onSimulatorRun={onSimulatorRun}
              />
            ) : (
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    border: '3px solid #e5e7eb',
                    borderTopColor: '#3b82f6',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                    '@keyframes spin': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' },
                    },
                  }}
                />
                <Typography 
                  sx={{ 
                    color: '#6b7280',
                    fontSize: '0.875rem',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    fontWeight: 500,
                  }}
                >
                  Loading editor...
                </Typography>
              </Box>
            )}
          </Box>
        ) : (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 1.5,
              py: 8,
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
                mb: 1,
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '6px',
                  backgroundColor: '#e5e7eb',
                }}
              />
            </Box>
            <Typography 
              sx={{ 
                color: '#111827',
                fontSize: '0.9375rem',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontWeight: 600,
              }}
            >
              No rule selected
            </Typography>
            <Typography 
              sx={{ 
                color: '#6b7280',
                fontSize: '0.875rem',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontWeight: 400,
              }}
            >
              Select a rule from the sidebar to begin editing
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}