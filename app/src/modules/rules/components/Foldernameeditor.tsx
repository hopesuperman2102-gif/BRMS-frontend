import { useEffect, useRef } from 'react';
import { Box, TextField } from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';

interface FolderNameEditorProps {
  folderName: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

export function FolderNameEditor({ folderName, onChange, onBlur, onKeyDown }: FolderNameEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const id = setTimeout(() => { inputRef.current?.focus(); inputRef.current?.select(); }, 0);
    return () => clearTimeout(id);
  }, []);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1, py: 0.5, flex: 1 }}>
      <Box sx={{
        width: 32, height: 32, borderRadius: '8px',
        background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <FolderIcon sx={{ color: '#D97706', fontSize: 17 }} />
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
            fontSize: '0.875rem', fontWeight: 600, borderRadius: '7px',
            '& fieldset': { borderColor: '#6552D0' },
            '&:hover fieldset': { borderColor: '#6552D0' },
            '&.Mui-focused fieldset': { borderColor: '#6552D0', borderWidth: '1.5px' },
          },
        }}
      />
    </Box>
  );
}