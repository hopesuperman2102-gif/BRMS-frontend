'use client';

import { Typography, Button, IconButton, Menu, MenuItem, Breadcrumbs, Link, Divider, Skeleton } from '@mui/material';
import { styled } from '@mui/material/styles';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import HomeIcon from '@mui/icons-material/Home';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { FileCard } from './FileCard';
import { FolderCard } from './FolderCard';
import { EmptyStatus } from './EmptyStatus';
import { brmsTheme } from 'app/src/core/theme/brmsTheme';
import { RulesRightPanelProps } from '../types/Explorertypes';



const { colors, fonts } = brmsTheme;

/* ─── Styled Components ─────────────────────────────────── */

const RightPanelRoot = styled('div')({
  flex: 1,
  background: colors.formBg,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
});

const TopBar = styled('div')({
  padding: '24px 28px 16px',
  flexShrink: 0,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
});

const TopBarLeft = styled('div')({});

const IndigoAccent = styled('div')({
  width: 28,
  height: 2,
  borderRadius: 1,
  background: colors.panelIndigo,
  marginBottom: 10,
});

const TitleRow = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
});

const BackButton = styled(IconButton)({
  width: 30,
  height: 30,
  borderRadius: '6px',
  color: colors.lightTextMid,
  border: `1px solid ${colors.lightBorder}`,
  backgroundColor: colors.white,
  transition: 'all 0.15s',
  '&:hover': {
    borderColor: colors.panelIndigo,
    color: colors.panelIndigo,
    backgroundColor: colors.panelIndigoMuted,
  },
});

const BackIcon = styled(ArrowBackIcon)({
  fontSize: 15,
});

const BreadcrumbNav = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
});

const VerticalLabel = styled(Typography)({
  fontSize: '0.8125rem',
  fontWeight: 500,
  color: colors.lightTextMid,
});

const Separator = styled(Typography)({
  color: colors.lightTextLow,
  fontSize: '0.875rem',
  lineHeight: 1,
});

const ProjectLabel = styled(Typography)({
  fontSize: '0.9375rem',
  fontWeight: 800,
  color: colors.lightTextHigh,
  letterSpacing: '-0.02em',
});

const NewButton = styled(Button)({
  background: colors.panelIndigo,
  borderRadius: '6px',
  padding: '8px 14px',
  textTransform: 'none',
  fontSize: '0.8125rem',
  fontWeight: 700,
  letterSpacing: '0.01em',
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

const MenuIconBox = styled('div')<{ variant?: 'file' | 'folder' }>(({ variant = 'file' }) => ({
  width: 26,
  height: 26,
  borderRadius: '6px',
  background: variant === 'file' ? colors.lightSurfaceHover : colors.surfaceBase,
  border: `1px solid ${colors.lightBorder}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const BreadcrumbBar = styled('div')({
  margin: '0 28px 12px',
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

const ActiveCrumb = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
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

const StyledDivider = styled(Divider)({
  margin: '0 28px 12px',
  borderColor: colors.lightBorder,
  flexShrink: 0,
});

const ItemListScroll = styled('div')({
  flex: 1,
  overflowY: 'auto',
  padding: '0 28px 24px',
});

const ItemListInner = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
});

/* ─── Component ─────────────────────────────────────────── */

export function RulesRightPanel({
  projectName,
  verticalName,
  breadcrumbs,
  visibleItems,
  editingFolderId,
  editingFolderName,
  newMenuAnchor,
  onBack,
  onNewMenuOpen,
  onNewMenuClose,
  onCreateNewRule,
  onCreateNewFolder,
  onNavigateToBreadcrumb,
  onOpenFolder,
  onOpenFile,
  onMenuOpen,
  onNameChange,
  onNameBlur,
  onNameKeyDown,
  onMouseEnterFile,
  onMouseLeaveFile,
}: RulesRightPanelProps) {
  return (
    <RightPanelRoot>
      {/* Top Bar */}
      <TopBar>
        <TopBarLeft>
          <IndigoAccent />
          <TitleRow>
            <BackButton size="small" onClick={onBack} disableRipple>
              <BackIcon />
            </BackButton>
            <BreadcrumbNav>
              <VerticalLabel>{verticalName || <Skeleton width={60} />}</VerticalLabel>
              <Separator>›</Separator>
              <ProjectLabel>{projectName || <Skeleton width={100} />}</ProjectLabel>
            </BreadcrumbNav>
          </TitleRow>
        </TopBarLeft>

        <div>
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
        </div>
      </TopBar>

      {/* Breadcrumb Bar */}
      <BreadcrumbBar>
        <Breadcrumbs
          separator={<BreadcrumbSeparator>›</BreadcrumbSeparator>}
        >
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
          <ItemCount>
            {visibleItems.length} {visibleItems.length === 1 ? 'item' : 'items'}
          </ItemCount>
        )}
      </BreadcrumbBar>

      <StyledDivider />

      {/* Item List */}
      <ItemListScroll>
        {visibleItems.length === 0 ? (
          <EmptyStatus />
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
                />
              ) : (
                <FileCard
                  key={item.rule_key}
                  item={item}
                  onOpen={() => onOpenFile(item)}
                  onMenuOpen={(e) => onMenuOpen(e, item)}
                  onMouseEnter={() => onMouseEnterFile(item)}
                  onMouseLeave={onMouseLeaveFile}
                />
              )
            )}
          </ItemListInner>
        )}
      </ItemListScroll>
    </RightPanelRoot>
  );
}