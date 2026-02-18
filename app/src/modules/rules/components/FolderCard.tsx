'use client';

import { Box, Typography, IconButton } from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useEffect, useRef } from 'react';
import { TextField } from '@mui/material';
import { FolderNode } from '../types/Explorertypes';

interface FolderCardProps {
  item: FolderNode;
  isEditing: boolean;
  editingFolderName: string;
  onOpen: () => void;
  onMenuOpen: (e: React.MouseEvent<HTMLElement>) => void;
  onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNameBlur: () => void;
  onNameKeyDown: (e: React.KeyboardEvent) => void;
}

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
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, px: '2px' }}>
      <Box sx={{ width: 34, height: 34, borderRadius: '8px', background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <FolderIcon sx={{ color: '#94A3B8', fontSize: 16 }} />
      </Box>
      <TextField
        inputRef={inputRef}
        size="small"
        value={folderName}
        onChange={onChange}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        onClick={(e) => e.stopPropagation()}
        sx={{
          flex: 1,
          '& .MuiOutlinedInput-root': {
            fontSize: '0.875rem', fontWeight: 600, borderRadius: '6px',
            fontFamily: '"DM Sans", sans-serif',
            '& fieldset': { borderColor: '#4F46E5' },
            '&:hover fieldset': { borderColor: '#4F46E5' },
            '&.Mui-focused fieldset': { borderColor: '#4F46E5', borderWidth: '1.5px' },
          },
        }}
      />
    </Box>
  );
}

export function FolderCard({ item, isEditing, editingFolderName, onOpen, onMenuOpen, onNameChange, onNameBlur, onNameKeyDown }: FolderCardProps) {
  return (
    <Box
      onClick={() => !isEditing && onOpen()}
      sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        px: '16px', py: '11px', borderRadius: '8px',
        border: '1px solid #E2E8F0', backgroundColor: '#FAFBFC',
        cursor: isEditing ? 'default' : 'pointer', transition: 'all 0.15s',
        '&:hover': !isEditing ? {
          borderColor: '#4F46E5',
          boxShadow: '0 0 0 3px rgba(79,70,229,0.08)',
          transform: 'translateY(-1px)',
          '& .folder-action': { opacity: 1 },
        } : {},
      }}
    >
      {isEditing ? (
        <FolderNameEditor folderName={editingFolderName} onChange={onNameChange} onBlur={onNameBlur} onKeyDown={onNameKeyDown} />
      ) : (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
            <Box sx={{ width: 34, height: 34, borderRadius: '8px', flexShrink: 0, background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FolderIcon sx={{ color: '#94A3B8', fontSize: 16 }} />
            </Box>
            <Typography sx={{ fontWeight: 600, fontSize: '0.9375rem', color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>
              {item.name}
            </Typography>
          </Box>
          <IconButton
            className="folder-action"
            size="small"
            onClick={(e) => { e.stopPropagation(); onMenuOpen(e); }}
            disableRipple
            sx={{ opacity: 0, ml: '8px', width: 28, height: 28, borderRadius: '6px', color: '#94A3B8', flexShrink: 0, transition: 'all 0.15s', '&:hover': { bgcolor: '#F1F5F9', color: '#475569' } }}
          >
            <MoreVertIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </>
      )}
    </Box>
  );
}