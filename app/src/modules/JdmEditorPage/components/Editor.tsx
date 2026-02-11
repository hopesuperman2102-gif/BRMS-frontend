'use client';

import { useEffect, useState } from 'react';
import { Box, Select, MenuItem, Button, FormControl, Typography } from '@mui/material';
import { RepoItem, JsonObject } from '../../../core/types/commonTypes';
import type { DecisionGraphType } from '@gorules/jdm-editor';
import type { ExecuteResponse } from 'app/src/api/executionApi';
import { EditorProps } from '../types/JdmEditorTypes';
import JdmEditorComponent from '../../../core/components/JdmEditorComponent';
import { ruleVersionsApi, RuleVersion } from 'app/src/api/ruleVersionsApi';
import { useAlertStore } from '../../../core/components/Alert';
import { brmsTheme } from '../../../core/theme/brmsTheme';

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
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
      >
        {/* Top bar with rule name and dropdown + commit button */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 2.5,
            py: 1.8,
            background: 'linear-gradient(135deg, rgba(101, 82, 208, 0.05) 0%, rgba(23, 32, 61, 0.02) 50%, rgba(255, 255, 255, 0.9) 100%)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
            flexShrink: 0,
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
          }}
        >
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 700,
              background: brmsTheme.gradients.primary,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontSize: '1.1rem',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            {selectedItem ? selectedItem.name : 'Select a file'}
          </Typography>

          {/* Right side - Dropdown and Commit button */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <Select
                value={selectedVersion}
                onChange={(e) => handleVersionChange(e.target.value)}
                disabled={isDropdownDisabled || isVersionsLoading}
                displayEmpty
                sx={{
                  bgcolor: isDropdownDisabled ? '#f3f4f6' : 'rgba(255, 255, 255, 0.9)',
                  borderRadius: 2,
                  backdropFilter: 'blur(20px)',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(101, 82, 208, 0.2)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(101, 82, 208, 0.4)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: brmsTheme.colors.primary,
                    borderWidth: '2px',
                  },
                }}
              >
                {versions.length === 0 ? (
                  <MenuItem value="" disabled>
                    {isVersionsLoading ? 'Loading...' : 'No versions'}
                  </MenuItem>
                ) : (
                  versions.map((version) => (
                    <MenuItem 
                      key={version.version} 
                      value={version.version}
                    >
                      {version.version}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            <Button
              variant="contained"
              onClick={handleCommit}
              disabled={!selectedItem || !currentGraph || isCommitting}
              sx={{
                background: brmsTheme.gradients.primary,
                boxShadow: brmsTheme.shadows.primarySoft,
                borderRadius: 2,
                transition: 'all 0.2s ease',
                '&:hover': {
                  boxShadow: brmsTheme.shadows.primaryHover,
                  background: brmsTheme.gradients.primaryHover,
                  transform: 'translateY(-1px)',
                },
                '&:disabled': {
                  background: '#d1d5db',
                  boxShadow: 'none',
                },
                textTransform: 'none',
                px: 3,
                fontWeight: 700,
              }}
            >
              {isCommitting ? 'Committing...' : 'Commit Changes'}
            </Button>
          </Box>
        </Box>

        {/* Editor content */}
        {selectedId && selectedItem?.type === 'file' ? (
          <Box sx={{ flex: 1, overflow: 'hidden' }}>
            {isVersionsLoading ? (
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#9ca3af',
                }}
              >
                Loading versions...
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
                  color: '#9ca3af',
                }}
              >
                Loading editor...
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
              color: '#9ca3af',
            }}
          >
            Select a file to edit
          </Box>
        )}
      </Box>
    </Box>
  );
}