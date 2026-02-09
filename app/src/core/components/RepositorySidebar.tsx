'use client';

import { Box, Typography, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { RepositorySidebarProps } from '../types/commonTypes';
import RepoTree from './RepoTree';
import { brmsTheme } from '../theme/brmsTheme';

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
    <Box 
      sx={{ 
        width: 280, 
        height: '100vh',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '2px 0 8px rgba(0, 0, 0, 0.04)',
      }}
    >
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: 2,
            py: 1.8,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
            background: brmsTheme.gradients.primary,
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {onBackClick && (
              <IconButton
                size="small"
                onClick={onBackClick}
                sx={{
                  color: 'white',
                  '&:hover': { 
                    bgcolor: 'rgba(255, 255, 255, 0.15)',
                  },
                }}
              >
                <ArrowBackIcon fontSize="small" />
              </IconButton>
            )}
            <Typography 
              fontWeight={700}
              sx={{
                color: 'white',
                fontSize: '0.95rem',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              {projectName}
            </Typography>
          </Box>

          <IconButton 
            size="small"
            sx={{
              color: 'white',
              '&:hover': { 
                bgcolor: 'rgba(255, 255, 255, 0.15)',
              },
            }}
          >
            <SearchIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Repo tree */}
        <Box 
          sx={{ 
            flex: 1, 
            overflowY: 'auto',
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: brmsTheme.scrollbars.thumb,
              borderRadius: '3px',
              '&:hover': {
                background: brmsTheme.scrollbars.thumbHover,
              },
            },
          }}
        >
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