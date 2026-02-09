'use client';

import { Box, Typography, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { RepositorySidebarProps } from '../types/commonTypes';
import RepoTree from './RepoTree';

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
  return (
    <Box sx={{ width: 280, height: '100vh', p: 1.5, bgcolor: '#e5e9f7' }}>
      <Box
        sx={{
          height: '100%',
          bgcolor: '#fff',
          borderRadius: 2,
          boxShadow: '0px 4px 12px rgba(0,0,0,0.06)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: 2,
            py: 1.5,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {onBackClick && (
              <IconButton
                size="small"
                onClick={onBackClick}
                sx={{
                  '&:hover': { bgcolor: 'grey.100' },
                }}
              >
                <ArrowBackIcon fontSize="small" />
              </IconButton>
            )}
            <Typography fontWeight={600}>
              {projectName}
            </Typography>
          </Box>

          <Box>
            <IconButton size="small">
              <SearchIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Repo tree */}
        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          <RepoTree
            items={items}
            selectedId={selectedId}
            expandedFolders={expandedFolders}
            onToggleFolder={onToggleFolder}
            onSelectItem={onSelectItem}
            onDragStart={onDragStart}
            onDropOnFolder={onDropOnFolder}
          />
        </Box>
      </Box>
    </Box>
  );
}