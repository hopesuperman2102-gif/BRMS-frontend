'use client';

import { useEffect, useState } from 'react';
import { Box, Select, MenuItem, Button, FormControl, Typography, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';
import type { DecisionGraphType } from '@gorules/jdm-editor';
import { EditorPropsExtended, RepoItem } from '@/modules/JdmEditorPage/types/JdmEditorTypes';
import JdmEditorComponent from '@/modules/JdmEditorPage/components/JdmEditorComponent';
import { ruleVersionsApi } from '@/modules/JdmEditorPage/api/ruleVersionsApi';
import { useAlertStore } from '@/core/components/RcAlertComponent';
import SaveIcon from '@mui/icons-material/Save';
import HistoryIcon from '@mui/icons-material/History';
import { JdmRuleVersion } from '@/modules/JdmEditorPage/types/jdmEditorEndpointsTypes';
import { brmsTheme } from '@/core/theme/brmsTheme';

// ─── Styled Components ────────────────────────────────────────────────────────

const RootBox = styled(Box)({
  flex: 1,
  minWidth: 0,
  overflow: 'hidden',
  backgroundColor: brmsTheme.colors.white,
  display: 'flex',
  flexDirection: 'column',
});

const HeaderBar = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px 24px',
  backgroundColor: brmsTheme.colors.white,
  borderBottom: `1px solid ${brmsTheme.colors.lightBorder}`,
  flexShrink: 0,
  minHeight: 64,
});

const RuleNameBox = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
});

const RuleNameText = styled(Typography)({
  fontWeight: 600,
  color: brmsTheme.colors.textDark,
  fontSize: '1rem',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  letterSpacing: '-0.01em',
});

const VersionControlBox = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 16,
});

const VersionSelectorBox = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
});

const HistoryIconStyled = styled(HistoryIcon)({
  fontSize: 18,
  color: brmsTheme.colors.textGray,
});

const VersionFormControl = styled(FormControl)({
  minWidth: 160,
});

const VersionSelect = styled(Select)({
  height: 36,
  backgroundColor: brmsTheme.colors.bgGrayLight,
  border: `1px solid ${brmsTheme.colors.lightBorder}`,
  borderRadius: '6px',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontSize: '0.875rem',
  fontWeight: 500,
  color: brmsTheme.colors.navTextHigh,
  transition: 'all 0.15s ease',
  '& .MuiOutlinedInput-notchedOutline': {
    border: 'none',
  },
  '&:hover': {
    backgroundColor: brmsTheme.colors.bgGray,
    borderColor: brmsTheme.colors.borderGrayHover,
  },
  '&.Mui-focused': {
    backgroundColor: brmsTheme.colors.white,
    borderColor: brmsTheme.colors.focusBlue,
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
  },
  '&.Mui-disabled': {
    backgroundColor: brmsTheme.colors.bgGrayLight,
    color: brmsTheme.colors.textGrayLight,
  },
});

const VersionMenuItem = styled(MenuItem)({
  fontSize: '0.875rem',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontWeight: 500,
  padding: '8px 16px',
});

const HeaderDivider = styled(Divider)({
  margin: '4px 0',
  backgroundColor: brmsTheme.colors.lightBorder,
});

const CommitButton = styled(Button)({
  height: 36,
  backgroundColor: brmsTheme.colors.primary,
  color: brmsTheme.colors.white,
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontSize: '0.875rem',
  fontWeight: 600,
  textTransform: 'none',
  padding: '0 20px',
  borderRadius: '6px',
  boxShadow: 'none',
  letterSpacing: '-0.01em',
  transition: 'all 0.15s ease',
  '&:hover': {
    backgroundColor: brmsTheme.colors.focusBlueHover,
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  },
  '&:active': {
    backgroundColor: brmsTheme.colors.focusBlueActive,
  },
  '&:disabled': {
    backgroundColor: brmsTheme.colors.lightBorder,
    color: brmsTheme.colors.textGrayLight,
  },
});

const CommitSaveIcon = styled(SaveIcon)({
  fontSize: 18,
});

const ContentArea = styled(Box)({
  flex: 1,
  overflow: 'hidden',
  backgroundColor: brmsTheme.colors.bgGrayLighter,
});

const EditorWrapperBox = styled(Box)({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
});

const CenteredStateBox = styled(Box)({
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  gap: 16,
});

const SpinnerBox = styled(Box)({
  width: 40,
  height: 40,
  border: `3px solid ${brmsTheme.colors.lightBorder}`,
  borderTopColor: brmsTheme.colors.focusBlue,
  borderRadius: '50%',
  animation: 'spin 0.8s linear infinite',
  '@keyframes spin': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' },
  },
});

const LoadingText = styled(Typography)({
  color: brmsTheme.colors.textGray,
  fontSize: '0.875rem',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontWeight: 500,
});

const EmptyStateBox = styled(Box)({
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  gap: 12,
  padding: '64px 0',
});

const EmptyStateIconBox = styled(Box)({
  width: 64,
  height: 64,
  borderRadius: '12px',
  backgroundColor: brmsTheme.colors.bgGray,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 8,
});

const EmptyStateIconInner = styled(Box)({
  width: 32,
  height: 32,
  borderRadius: '6px',
  backgroundColor: brmsTheme.colors.lightBorder,
});

const EmptyStateTitleText = styled(Typography)({
  color: brmsTheme.colors.textDark,
  fontSize: '0.9375rem',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontWeight: 600,
});

const EmptyStateSubtitleText = styled(Typography)({
  color: brmsTheme.colors.textGray,
  fontSize: '0.875rem',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontWeight: 400,
});

// ─── Constants ────────────────────────────────────────────────────────────────

const EMPTY_GRAPH: DecisionGraphType = {
  nodes: [],
  edges: [],
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function Editor({
  items,
  selectedId,
  onSimulatorRun,
  isReviewer = false,
}: EditorPropsExtended) {
  const [selectedVersion, setSelectedVersion] = useState('');
  const [versions, setVersions] = useState<JdmRuleVersion[]>([]);
  const [currentGraph, setCurrentGraph] = useState<DecisionGraphType | null>(null);
  const [isVersionsLoading, setIsVersionsLoading] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);
  const { showAlert } = useAlertStore();

  const findItem = (list: RepoItem[], id: string | number): RepoItem | null => {
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
        // Only call list API once for THIS rule only
        const versionsList = await ruleVersionsApi.listVersions(String(selectedItemId));

        if (versionsList && versionsList.length > 0) {
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
    if (isReviewer) {
      showAlert('You do not have permission to commit changes.', 'info');
      return;
    }

    if (!selectedItem || !currentGraph) {
      console.error('No item selected or no graph data');
      showAlert('No item selected or no graph data', 'error');
      return;
    }

    setIsCommitting(true);
    try {
      // Create new version
      await ruleVersionsApi.createVersion({
        rule_key: String(selectedItem.id),
        jdm: currentGraph,
      });

      // Refresh versions list to get the newly created version
      const updatedVersions = await ruleVersionsApi.listVersions(String(selectedItem.id));

      if (updatedVersions && updatedVersions.length > 0) {
        setVersions(updatedVersions);
        // Set the latest version as selected (first item in array)
        const latestVersion = updatedVersions[0];
        setSelectedVersion(latestVersion.version);

        showAlert(`Changes committed successfully!`, 'success');
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
    <RootBox>
      {/* Header Bar - Enterprise Clean */}
      <HeaderBar>
        {/* Left - Rule Name */}
        <RuleNameBox>
          <RuleNameText variant="h6">
            {selectedItem ? selectedItem.name : 'Select a rule to begin'}
          </RuleNameText>
        </RuleNameBox>

        {/* Right - Version Control */}
        <VersionControlBox>
          {/* Version Selector */}
          <VersionSelectorBox>
            <HistoryIconStyled />
            <VersionFormControl size="small">
              <VersionSelect
                value={selectedVersion}
                onChange={(e) => handleVersionChange(e.target.value as string)}
                disabled={isDropdownDisabled || isVersionsLoading}
                displayEmpty
              >
                {versions.length === 0 ? (
                  <MenuItem value="" disabled>
                    {isVersionsLoading ? 'Loading versions...' : 'No versions available'}
                  </MenuItem>
                ) : (
                  versions.map((version) => (
                    <VersionMenuItem key={version.version} value={version.version}>
                      {version.version}
                    </VersionMenuItem>
                  ))
                )}
              </VersionSelect>
            </VersionFormControl>
          </VersionSelectorBox>

          {!isReviewer && (
            <>
              <HeaderDivider orientation="vertical" flexItem />

              {/* Commit Button */}
              <CommitButton
                variant="contained"
                onClick={handleCommit}
                disabled={!selectedItem || !currentGraph || isCommitting}
                startIcon={<CommitSaveIcon />}
              >
                {isCommitting ? 'Saving...' : 'Commit Changes'}
              </CommitButton>
            </>
          )}
        </VersionControlBox>
      </HeaderBar>

      {/* Editor Content Area */}
      <ContentArea>
        {selectedId && selectedItem?.type === 'file' ? (
          <EditorWrapperBox>
            {isVersionsLoading ? (
              <CenteredStateBox>
                <SpinnerBox />
                <LoadingText>Loading versions...</LoadingText>
              </CenteredStateBox>
            ) : currentGraph !== null ? (
              <JdmEditorComponent
                value={currentGraph}
                onChange={isReviewer ? () => {} : handleGraphChange}
                onSimulatorRun={onSimulatorRun}
                isReviewer={isReviewer}
              />
            ) : (
              <CenteredStateBox>
                <SpinnerBox />
                <LoadingText>Loading editor...</LoadingText>
              </CenteredStateBox>
            )}
          </EditorWrapperBox>
        ) : (
          <EmptyStateBox>
            <EmptyStateIconBox>
              <EmptyStateIconInner />
            </EmptyStateIconBox>
            <EmptyStateTitleText>No rule selected</EmptyStateTitleText>
            <EmptyStateSubtitleText>
              Select a rule from the sidebar to begin editing
            </EmptyStateSubtitleText>
          </EmptyStateBox>
        )}
      </ContentArea>
    </RootBox>
  );
}