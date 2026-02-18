import { Box, Typography, IconButton } from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { FolderNode } from '../types/Explorertypes';
import { FolderNameEditor } from './Foldernameeditor';


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

export function FolderCard({
  item, isEditing, editingFolderName,
  onOpen, onMenuOpen, onNameChange, onNameBlur, onNameKeyDown,
}: FolderCardProps) {
  return (
    <Box
      onClick={() => !isEditing && onOpen()}
      sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        px: 2, py: 1.375, borderRadius: '10px',
        border: '1px solid #E5E7EB', backgroundColor: '#FAFAFA',
        cursor: isEditing ? 'default' : 'pointer',
        transition: 'all 0.18s ease',
        ...(!isEditing && {
          '&:hover': {
            borderColor: '#FCD34D', backgroundColor: '#FFFDF7',
            boxShadow: '0 2px 10px rgba(217, 119, 6, 0.08)',
            transform: 'translateY(-1px)',
            '& .folder-action': { opacity: 1 },
          },
        }),
      }}
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0 }}>
            <Box sx={{
              width: 36, height: 36, borderRadius: '9px', flexShrink: 0,
              background: 'linear-gradient(145deg, #FEF3C7 0%, #FDE68A 100%)',
              boxShadow: '0 1px 4px rgba(217,119,6,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FolderIcon sx={{ color: '#D97706', fontSize: 19 }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.name}
              </Typography>
              <Typography sx={{ fontSize: '0.72rem', color: '#B45309', fontWeight: 500 }}>Folder</Typography>
            </Box>
          </Box>
          <IconButton
            className="folder-action"
            size="small"
            onClick={(e) => { e.stopPropagation(); onMenuOpen(e); }}
            sx={{ opacity: 0, width: 30, height: 30, borderRadius: '7px', color: '#9CA3AF', transition: 'all 0.15s', '&:hover': { bgcolor: '#FEF3C7', color: '#D97706' } }}
          >
            <MoreVertIcon sx={{ fontSize: 17 }} />
          </IconButton>
        </>
      )}
    </Box>
  );
}