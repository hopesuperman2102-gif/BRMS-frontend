'use client';

import { Typography, IconButton, TextField } from '@mui/material';
import { styled } from '@mui/material/styles';
import FolderIcon from '@mui/icons-material/Folder';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useEffect, useRef } from 'react';
import { FolderCardProps } from '../types/Explorertypes';
import { brmsTheme } from 'app/src/core/theme/brmsTheme';

const { colors, fonts } = brmsTheme;

/* ─── Styled Components ─────────────────────────────────── */

const EditorWrap = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  flex: 1,
  padding: '0 2px',
});

const IconWrap = styled('div')({
  width: 34,
  height: 34,
  borderRadius: '8px',
  background: colors.surfaceBase,
  border: `1px solid ${colors.lightBorder}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
});

const FolderIconStyled = styled(FolderIcon)({
  color: colors.lightTextLow,
  fontSize: 16,
});

const StyledTextField = styled(TextField)({
  flex: 1,
  '& .MuiOutlinedInput-root': {
    fontSize: '0.875rem',
    fontWeight: 600,
    borderRadius: '6px',
    fontFamily: fonts.sans,
    '& fieldset': { borderColor: colors.panelIndigo },
    '&:hover fieldset': { borderColor: colors.panelIndigo },
    '&.Mui-focused fieldset': { borderColor: colors.panelIndigo, borderWidth: '1.5px' },
  },
});

const CardRoot = styled('div')<{ isediting: string }>(({ isediting }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '11px 16px',
  borderRadius: '8px',
  border: `1px solid ${colors.lightBorder}`,
  backgroundColor: colors.statusDraftBg,
  cursor: isediting === 'true' ? 'default' : 'pointer',
  transition: 'all 0.15s',
  ...(isediting !== 'true' && {
    '&:hover': {
      borderColor: colors.panelIndigo,
      boxShadow: `0 0 0 3px ${colors.panelIndigoMuted}`,
      transform: 'translateY(-1px)',
      '& .folder-action': { opacity: 1 },
    },
  }),
}));

const CardInner = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  flex: 1,
  minWidth: 0,
});

const FolderName = styled(Typography)({
  fontWeight: 600,
  fontSize: '0.9375rem',
  color: colors.lightTextHigh,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  letterSpacing: '-0.01em',
});

const MenuButton = styled(IconButton)({
  opacity: 0,
  marginLeft: '8px',
  width: 28,
  height: 28,
  borderRadius: '6px',
  color: colors.lightTextLow,
  flexShrink: 0,
  transition: 'all 0.15s',
  '&:hover': {
    backgroundColor: colors.lightSurfaceHover,
    color: colors.lightTextMid,
  },
});

/* ─── FolderNameEditor ──────────────────────────────────── */

function FolderNameEditor({ folderName, onChange, onBlur, onKeyDown }: {
  folderName: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const id = setTimeout(() => { inputRef.current?.focus(); inputRef.current?.select(); }, 0);
    return () => clearTimeout(id);
  }, []);

  return (
    <EditorWrap>
      <IconWrap>
        <FolderIconStyled />
      </IconWrap>
      <StyledTextField
        inputRef={inputRef}
        size="small"
        value={folderName}
        onChange={onChange}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        onClick={(e) => e.stopPropagation()}
      />
    </EditorWrap>
  );
}

/* ─── FolderCard ────────────────────────────────────────── */

export function FolderCard({ item, isEditing, editingFolderName, onOpen, onMenuOpen, onNameChange, onNameBlur, onNameKeyDown, isReviewer = false }: FolderCardProps & { isReviewer?: boolean }) {
  return (
    <CardRoot
      isediting={String(isEditing)}
      onClick={() => !isEditing && onOpen()}
    >
      {isEditing ? (
        <FolderNameEditor
          folderName={editingFolderName}
          onChange={onNameChange}
          onBlur={onNameBlur}
          onKeyDown={onNameKeyDown}
        />
      ) : (
        <>
          <CardInner>
            <IconWrap>
              <FolderIconStyled />
            </IconWrap>
            <FolderName>{item.name}</FolderName>
          </CardInner>

          {!isReviewer && (
            <MenuButton
              className="folder-action"
              size="small"
              onClick={(e) => { e.stopPropagation(); onMenuOpen(e); }}
              disableRipple
            >
              <MoreVertIcon sx={{ fontSize: 16 }} />
            </MenuButton>
          )}
        </>
      )}
    </CardRoot>
  );
}