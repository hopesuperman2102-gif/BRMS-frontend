'use client';

import { Box, Typography, IconButton} from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import AccountTree from '@mui/icons-material/AccountTree';
import RepoTree from '@/modules/JdmEditorPage/components/RepoTree';
import { RepositorySidebarProps } from '@/modules/JdmEditorPage/types/JdmEditorTypes';
import { brmsTheme } from '@/core/theme/brmsTheme';

const { colors } = brmsTheme;

const SidebarContainer = styled(Box)({
  width: 280,
  height: '100vh',
  backgroundColor: brmsTheme.colors.white,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
});

const Header = styled(Box)({
  padding: '16px 20px',
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  borderBottom: `1px solid ${brmsTheme.colors.lightBorder}`,
  flexShrink: 0,
  backgroundColor: brmsTheme.colors.white,
});

const HeaderTopRow = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
});

const BackButton = styled(IconButton)({
  width: 34,
  height: 34,
  borderRadius: '8px',
  background: colors.white,
  border: `1px solid ${colors.lightBorder}`,
  color: colors.lightTextMid,
  transition: 'all 0.15s',
  '&:hover': {
    background: colors.primaryGlowSoft,
    color: colors.primary,
    borderColor: colors.primaryGlowMid,
  },
});

const ProjectNameBox = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  flex: 1,
  minWidth: 0,
});

const AccountTreeIcon = styled(AccountTree)({
  fontSize: 20,
  color: brmsTheme.colors.primary,
  flexShrink: 0,
});

const RepoTreeLabel = styled(Typography)({
  color: brmsTheme.colors.lightTextHigh,
  fontSize: '0.9375rem',
  fontWeight: 600,
  fontFamily: brmsTheme.fonts.sans,
  letterSpacing: '-0.01em',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

const RulesLabelBar = styled(Box)({
  padding: '12px 20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: brmsTheme.colors.surfaceBase,
  borderBottom: `1px solid ${brmsTheme.colors.lightBorder}`,
});

const ProjectNameText = styled(Typography)({
  fontSize: '0.75rem',
  fontWeight: 600,
  color: brmsTheme.colors.lightTextMid,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  fontFamily: brmsTheme.fonts.sans,
});

const TreeScrollContainer = styled(Box)({
  flex: 1,
  overflowY: 'auto',
  backgroundColor: brmsTheme.colors.white,
  minHeight: 0,
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    background: brmsTheme.colors.lightBorder,
    borderRadius: '3px',
    '&:hover': {
      background: brmsTheme.colors.lightBorderHover,
    },
  },
});

const EmptyStateContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  gap: 12,
  padding: '48px 24px',
});

const EmptyIconWrapper = styled(Box)({
  width: 48,
  height: 48,
  borderRadius: '12px',
  backgroundColor: brmsTheme.colors.lightSurfaceHover,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const EmptyFolderIcon = styled(FolderOutlinedIcon)({
  fontSize: 24,
  color: brmsTheme.colors.neutralGray,
});

const EmptyTitle = styled(Typography)({
  color: brmsTheme.colors.lightTextHigh,
  fontSize: '0.875rem',
  fontWeight: 600,
  fontFamily: brmsTheme.fonts.sans,
  textAlign: 'center',
});

const EmptySubtitle = styled(Typography)({
  color: brmsTheme.colors.lightTextMid,
  fontSize: '0.8125rem',
  fontFamily: brmsTheme.fonts.sans,
  textAlign: 'center',
  lineHeight: 1.5,
});

export default function RepositorySidebar({
  projectName,
  items,
  selectedId,
  expandedFolders,
  onToggleFolder,
  onSelectItem,
  onAddClick,
  onDragStart,
  onDropOnFolder,
  onBackClick,
}: RepositorySidebarProps) {
  void onAddClick;

  return (
    <SidebarContainer>
      {/* Header */}
      <Header>
        {/* Top Row - Back Button & Project Name */}
        <HeaderTopRow>
          {onBackClick && (
            <BackButton onClick={onBackClick}>
              <ArrowBackIcon sx={{ fontSize: 18 }} />
            </BackButton>
          )}
          <ProjectNameBox>
            <AccountTreeIcon />
            <RepoTreeLabel>Repository Tree</RepoTreeLabel>
          </ProjectNameBox>
        </HeaderTopRow>
      </Header>

      {/* Rules Label */}
      <RulesLabelBar>
        <ProjectNameText>{projectName}</ProjectNameText>
      </RulesLabelBar>

      {/* Repo Tree */}
      <TreeScrollContainer>
        {items.length > 0 ? (
          <RepoTree
            items={items}
            selectedId={selectedId}
            expandedFolders={expandedFolders}
            onToggleFolder={onToggleFolder}
            onSelectItem={onSelectItem}
            onDragStart={onDragStart}
            onDropOnFolder={onDropOnFolder}
          />
        ) : (
          <EmptyStateContainer>
            <EmptyIconWrapper>
              <EmptyFolderIcon />
            </EmptyIconWrapper>
            <EmptyTitle>No rules found</EmptyTitle>
            <EmptySubtitle>Create your first rule to get started</EmptySubtitle>
          </EmptyStateContainer>
        )}
      </TreeScrollContainer>
    </SidebarContainer>
  );
}