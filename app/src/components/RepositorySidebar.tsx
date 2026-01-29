'use client';

import { Box, Typography, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import RepoTree from './RepoTree';
import { RepositorySidebarProps } from './types';

export default function RepositorySidebar({
  items,
  selectedId,
  expandedFolders,
  onToggleFolder,
  onSelectItem,
  onAddClick,
  onDragStart,
  onDropOnFolder,
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
          <Typography fontWeight={600}>Repository</Typography>

          <Box>
            <IconButton size="small">
              <SearchIcon fontSize="small" />
            </IconButton>

            <IconButton size="small" onClick={(e) => onAddClick(e.currentTarget)}>
              <AddIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Tree */}
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