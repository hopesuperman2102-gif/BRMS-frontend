'use client';

import {
  Box, Typography, Button, Menu, MenuItem, Breadcrumbs, Link, Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import HomeIcon from '@mui/icons-material/Home';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import AddIcon from '@mui/icons-material/Add';
import { FileCard } from './FileCard';
import { FolderCard } from './FolderCard';
import { brmsTheme } from 'app/src/core/theme/brmsTheme';
import { Breadcrumb, ExplorerItem, FileNode, FolderNode } from '../types/Explorertypes';

const { colors, fonts } = brmsTheme;

/* ─── Types ───────────────────────────────────────────────── */
interface RulesRightPanelProps {
  projectName: string;
  breadcrumbs: Breadcrumb[];
  visibleItems: ExplorerItem[];
  editingFolderId: string | null;
  editingFolderName: string;
  newMenuAnchor: HTMLElement | null;
  anchorEl: HTMLElement | null;
  onBack: () => void;
  onNewMenuOpen: (e: React.MouseEvent<HTMLElement>) => void;
  onNewMenuClose: () => void;
  onCreateNewRule: () => void;
  onCreateNewFolder: () => void;
  onNavigateToBreadcrumb: (crumb: Breadcrumb) => void;
  onOpenFolder: (item: FolderNode) => void;
  onOpenFile: (item: FileNode) => void;
  onMenuOpen: (e: React.MouseEvent<HTMLElement>, item: ExplorerItem) => void;
  onMenuClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNameBlur: () => void;
  onNameKeyDown: (e: React.KeyboardEvent) => void;
  onMouseEnterFile: (item: FileNode) => void;
  onMouseLeaveFile: () => void;
  isReviewer?: boolean;
}

/* ─── Styled Components ───────────────────────────────────── */
const RightPanel = styled(Box)({
  flex: 1,
  background: colors.formBg,
  display: 'flex',
  flexDirection: 'column',
  padding: '28px 32px',
  overflow: 'hidden',
});

const RightHeader = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: 20,
  flexShrink: 0,
});

const HeaderAccentLine = styled(Box)({
  width: 28,
  height: 2,
  borderRadius: 1,
  background: colors.panelIndigo,
  marginBottom: 10,
});

const RightTitle = styled(Typography)({
  fontSize: '1.125rem',
  fontWeight: 800,
  color: colors.lightTextHigh,
  letterSpacing: '-0.025em',
  lineHeight: 1.1,
  marginBottom: 4,
});

const RightSubtitle = styled(Typography)({
  fontSize: '0.8125rem',
  color: colors.lightTextMid,
  lineHeight: 1.6,
});

const NewButton = styled(Button)({
  background: colors.panelIndigo,
  borderRadius: '6px',
  padding: '8px 16px',
  textTransform: 'none',
  fontSize: '0.8125rem',
  fontWeight: 700,
  letterSpacing: '0.01em',
  whiteSpace: 'nowrap',
  flexShrink: 0,
  marginLeft: 16,
  boxShadow: `0 1px 3px rgba(0,0,0,0.12), 0 4px 12px ${colors.panelIndigoGlowMid}`,
  transition: 'all 0.15s',
  '&:hover': {
    background: colors.panelIndigoHover,
    boxShadow: '0 1px 3px rgba(0,0,0,0.16), 0 6px 20px rgba(79,70,229,0.28)',
    transform: 'translateY(-1px)',
  },
});

const NewMenuPaper = {
  '& .MuiPaper-root': {
    borderRadius: '8px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
    border: `1px solid ${colors.lightBorder}`,
    minWidth: '160px',
    mt: '6px',
  },
  '& .MuiList-root': { py: '6px' },
};

const MenuIconBox = styled(Box)<{ variant?: 'file' | 'folder' }>(({ variant = 'file' }) => ({
  width: 26,
  height: 26,
  borderRadius: '6px',
  background: variant === 'file' ? colors.lightSurfaceHover : colors.surfaceBase,
  border: `1px solid ${colors.lightBorder}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const BreadcrumbBar = styled(Box)({
  marginBottom: 16,
  padding: '8px 12px',
  backgroundColor: colors.white,
  borderRadius: '8px',
  border: `1px solid ${colors.lightBorder}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexShrink: 0,
});

const BreadcrumbSeparator = styled(Typography)({
  color: colors.lightTextLow,
  fontSize: '0.75rem',
  margin: '0 2px',
});

const ActiveCrumb = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 5,
});

const ActiveCrumbText = styled(Typography)({
  fontWeight: 700,
  fontSize: '0.8rem',
  color: colors.panelIndigo,
  letterSpacing: '0.01em',
  fontFamily: fonts.mono,
});

const ItemCount = styled(Typography)({
  fontSize: '0.6875rem',
  fontWeight: 700,
  color: colors.lightTextMid,
  fontFamily: fonts.mono,
  letterSpacing: '0.04em',
});

const ScrollArea = styled(Box)({
  flex: 1,
  overflow: 'auto',
});

const ItemListInner = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
});

const EmptyBox = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: 200,
  gap: 12,
});

const EmptyIconBox = styled(Box)({
  width: 48,
  height: 48,
  borderRadius: '50%',
  background: colors.lightSurfaceHover,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const EmptyTitle = styled(Typography)({
  fontWeight: 700,
  color: colors.lightTextHigh,
  fontSize: '0.9375rem',
  marginBottom: 4,
  letterSpacing: '-0.01em',
  textAlign: 'center',
});

const EmptySubtitle = styled(Typography)({
  color: colors.lightTextMid,
  fontSize: '0.8125rem',
  textAlign: 'center',
});

const StyledMenu = styled(Menu)({
  '& .MuiPaper-root': {
    borderRadius: '8px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
    minWidth: 140,
    border: `1px solid ${colors.lightBorder}`,
  },
});

const EditMenuItem = styled(MenuItem)({
  fontSize: '0.8125rem',
  fontWeight: 500,
  color: colors.lightTextHigh,
  padding: '10px 16px',
  '&:hover': { backgroundColor: '#F8FAFC' },
});

const DeleteMenuItem = styled(MenuItem)({
  fontSize: '0.8125rem',
  fontWeight: 500,
  color: colors.deleteRed,
  padding: '10px 16px',
  '&:hover': { backgroundColor: colors.errorBg },
});

/* ─── Component ───────────────────────────────────────────── */
export default function RulesRightPanel({
  projectName,
  breadcrumbs,
  visibleItems,
  editingFolderId,
  editingFolderName,
  newMenuAnchor,
  anchorEl,
  onNewMenuOpen,
  onNewMenuClose,
  onCreateNewRule,
  onCreateNewFolder,
  onNavigateToBreadcrumb,
  onOpenFolder,
  onOpenFile,
  onMenuOpen,
  onMenuClose,
  onEdit,
  onDelete,
  onNameChange,
  onNameBlur,
  onNameKeyDown,
  onMouseEnterFile,
  onMouseLeaveFile,
  isReviewer = false,
}: RulesRightPanelProps) {
  return (
    <RightPanel>
      {/* ─── Header ─── */}
      <RightHeader>
        <Box>
          <HeaderAccentLine />
          <RightTitle>All Rules</RightTitle>
          <RightSubtitle>Browse and manage rules for {projectName || 'this project'}</RightSubtitle>
        </Box>

        {!isReviewer && (
          <>
            <NewButton
              variant="contained"
              startIcon={<AddIcon sx={{ fontSize: '14px !important' }} />}
              endIcon={<KeyboardArrowDownIcon sx={{ fontSize: '14px !important' }} />}
              onClick={onNewMenuOpen}
              disableRipple
              disableElevation
            >
              New
            </NewButton>

            <Menu
              anchorEl={newMenuAnchor}
              open={!!newMenuAnchor}
              onClose={onNewMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              sx={NewMenuPaper}
            >
              <MenuItem
                onClick={onCreateNewRule}
                sx={{ fontSize: '0.8125rem', fontWeight: 500, color: colors.lightTextHigh, mx: '6px', borderRadius: '6px', py: '9px', px: '10px', gap: '10px', '&:hover': { bgcolor: colors.panelIndigoMuted } }}
              >
                <MenuIconBox variant="file">
                  <InsertDriveFileOutlinedIcon sx={{ fontSize: 14, color: colors.tabTextInactive }} />
                </MenuIconBox>
                New Rule
              </MenuItem>
              <MenuItem
                onClick={onCreateNewFolder}
                sx={{ fontSize: '0.8125rem', fontWeight: 500, color: colors.lightTextHigh, mx: '6px', borderRadius: '6px', py: '9px', px: '10px', gap: '10px', '&:hover': { bgcolor: colors.statusDraftBg } }}
              >
                <MenuIconBox variant="folder">
                  <FolderIcon sx={{ fontSize: 14, color: colors.lightTextLow }} />
                </MenuIconBox>
                New Folder
              </MenuItem>
            </Menu>
          </>
        )}
      </RightHeader>

      {/* ─── Breadcrumb Bar ─── */}
      <BreadcrumbBar>
        <Breadcrumbs separator={<BreadcrumbSeparator>›</BreadcrumbSeparator>}>
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            const Icon   = idx === 0 ? HomeIcon : FolderIcon;
            return isLast ? (
              <ActiveCrumb key={crumb.path}>
                <Icon sx={{ fontSize: 12, color: colors.panelIndigo }} />
                <ActiveCrumbText>{crumb.name}</ActiveCrumbText>
              </ActiveCrumb>
            ) : (
              <Link
                key={crumb.path}
                component="button"
                underline="none"
                onClick={() => onNavigateToBreadcrumb(crumb)}
                sx={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  color: colors.lightTextMid, fontWeight: 500, fontSize: '0.8rem',
                  borderRadius: '4px', px: '4px', transition: 'all 0.15s',
                  fontFamily: fonts.mono,
                  '&:hover': { color: colors.panelIndigo, bgcolor: colors.panelIndigoMuted },
                }}
              >
                <Icon sx={{ fontSize: 12 }} />{crumb.name}
              </Link>
            );
          })}
        </Breadcrumbs>
        {visibleItems.length > 0 && (
          <ItemCount>{visibleItems.length} {visibleItems.length === 1 ? 'item' : 'items'}</ItemCount>
        )}
      </BreadcrumbBar>

      {/* ─── List ─── */}
      <ScrollArea>
        {visibleItems.length === 0 ? (
          <EmptyBox>
            <EmptyIconBox>
              <FolderOpenIcon sx={{ fontSize: 22, color: colors.lightTextLow }} />
            </EmptyIconBox>
            <Box textAlign="center">
              <EmptyTitle>This folder is empty</EmptyTitle>
              <EmptySubtitle>Create a new rule or folder to get started</EmptySubtitle>
            </Box>
          </EmptyBox>
        ) : (
          <ItemListInner>
            {visibleItems.map((item) =>
              item.kind === 'folder' ? (
                <FolderCard
                  key={item.path}
                  item={item}
                  isEditing={editingFolderId === item.path}
                  editingFolderName={editingFolderName}
                  onOpen={() => onOpenFolder(item)}
                  onMenuOpen={(e) => onMenuOpen(e, item)}
                  onNameChange={onNameChange}
                  onNameBlur={onNameBlur}
                  onNameKeyDown={onNameKeyDown}
                  isReviewer={isReviewer}
                />
              ) : (
                <FileCard
                  key={item.rule_key}
                  item={item}
                  onOpen={() => onOpenFile(item)}
                  onMenuOpen={(e) => onMenuOpen(e, item)}
                  onMouseEnter={() => onMouseEnterFile(item)}
                  onMouseLeave={onMouseLeaveFile}
                  isReviewer={isReviewer}
                />
              )
            )}
          </ItemListInner>
        )}
      </ScrollArea>

      {/* ─── Context Menu ─── */}
      {!isReviewer && (
        <StyledMenu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={onMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <EditMenuItem onClick={onEdit}>Rename</EditMenuItem>
          <Divider sx={{ my: '4px', borderColor: colors.lightBorder }} />
          <DeleteMenuItem onClick={onDelete}>Delete</DeleteMenuItem>
        </StyledMenu>
      )}
    </RightPanel>
  );
}