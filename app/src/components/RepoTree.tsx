'use client';

import { Box, Typography } from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { RepoTreeProps } from './types';

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
            {/* Item Row */}
            <Box
              onClick={() => {
                if (isFolder) {
                  onToggleFolder(item.id);
                }
                onSelectItem(item);
              }}
              draggable
              onDragStart={() => onDragStart(item)}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (isFolder) {
                  onDropOnFolder(item);
                }
              }}
              onDragOver={(e) => {
                if (isFolder) {
                  e.preventDefault();
                }
              }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1.5,
                py: 0.75,
                pl: 1.5 + depth * 1.5,
                cursor: 'pointer',
                bgcolor: isSelected ? '#eef2ff' : 'transparent',
                borderLeft: isSelected ? '2px solid #6366f1' : '2px solid transparent',
                '&:hover': {
                  bgcolor: isSelected ? '#eef2ff' : '#f8fafc',
                },
              }}
            >
              {/* Expand/Collapse Icon */}
              {isFolder && (
                <Box sx={{ width: 16, height: 16, display: 'flex', alignItems: 'center' }}>
                  {isExpanded ? (
                    <ExpandMoreIcon sx={{ fontSize: 16, color: '#6b7280' }} />
                  ) : (
                    <ChevronRightIcon sx={{ fontSize: 16, color: '#6b7280' }} />
                  )}
                </Box>
              )}

              {/* Icon */}
              <Box sx={{ display: 'flex', alignItems: 'center', ml: isFolder ? 0 : 2 }}>
                {isFolder ? (
                  isExpanded ? (
                    <FolderOpenIcon sx={{ fontSize: 18, color: '#f59e0b' }} />
                  ) : (
                    <FolderIcon sx={{ fontSize: 18, color: '#f59e0b' }} />
                  )
                ) : (
                  <InsertDriveFileIcon sx={{ fontSize: 18, color: '#6b7280' }} />
                )}
              </Box>

              {/* Name */}
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: isSelected ? 500 : 400,
                  color: isSelected ? '#4f46e5' : '#111827',
                  userSelect: 'none',
                }}
              >
                {item.name}
              </Typography>
            </Box>

            {/* Children */}
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