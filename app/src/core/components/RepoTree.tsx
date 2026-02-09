'use client';

import { Box, Typography } from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { RepoTreeProps } from '../types/commonTypes';

export default function RepoTree({
  items,
  selectedId,
  expandedFolders,
  onToggleFolder,
  onSelectItem,
  onDragStart,
  onDropOnFolder,
  depth = 0,
}: RepoTreeProps) {
  return (
    <Box>
      {items.map((item) => {
        const isSelected = item.id === selectedId;
        const isExpanded = expandedFolders.has(item.id);
        const isFolder = item.type === 'folder';

        return (
          <Box key={item.id}>
            <Box
              onClick={() => {
                if (isFolder) onToggleFolder(item.id);
                onSelectItem(item);
              }}
              draggable
              onDragStart={() => onDragStart(item)}
              onDrop={(e) => {
                e.preventDefault();
                if (isFolder) onDropOnFolder(item);
              }}
              onDragOver={(e) => isFolder && e.preventDefault()}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1.5,
                py: 0.85,
                pl: 1.5 + depth * 1.5,
                cursor: 'pointer',
                bgcolor: isSelected 
                  ? 'linear-gradient(90deg, rgba(101, 82, 208, 0.1) 0%, rgba(23, 32, 61, 0.05) 100%)' 
                  : 'transparent',
                borderLeft: isSelected ? '3px solid #6552D0' : '3px solid transparent',
                borderRadius: 2,
                transition: 'all 0.2s ease',
                '&:hover': { 
                  bgcolor: isSelected 
                    ? 'linear-gradient(90deg, rgba(101, 82, 208, 0.15) 0%, rgba(23, 32, 61, 0.08) 100%)' 
                    : 'rgba(101, 82, 208, 0.05)',
                  transform: 'translateX(2px)',
                },
              }}
            >
              {isFolder && (
                <Box sx={{ width: 16 }}>
                  {isExpanded ? <ExpandMoreIcon /> : <ChevronRightIcon />}
                </Box>
              )}

              {isFolder ? (
                isExpanded ? <FolderOpenIcon /> : <FolderIcon />
              ) : (
                <InsertDriveFileIcon />
              )}

              <Typography 
                fontSize={13}
                sx={{
                  fontWeight: isSelected ? 600 : 400,
                  color: isSelected ? '#6552D0' : '#475569',
                }}
              >
                {item.name}
              </Typography>
            </Box>

            {isFolder && isExpanded && item.children && (
              <RepoTree
                items={item.children}
                selectedId={selectedId}
                expandedFolders={expandedFolders}
                onToggleFolder={onToggleFolder}
                onSelectItem={onSelectItem}
                onDragStart={onDragStart}
                onDropOnFolder={onDropOnFolder}
                depth={depth + 1}
              />
            )}
          </Box>
        );
      })}
    </Box>
  );
}