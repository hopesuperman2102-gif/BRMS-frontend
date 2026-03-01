'use client';

import { Box, Typography, IconButton} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import AccountTree from '@mui/icons-material/AccountTree';
import RepoTree from './RepoTree';
import { RepositorySidebarProps } from '../types/JdmEditorTypes';
import { brmsTheme } from 'app/src/core/theme/brmsTheme';

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
  void onAddClick;
  
  return (
    <Box 
      sx={{ 
        width: 280, 
        height: '100vh',
        backgroundColor: brmsTheme.colors.white,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2.5,
          py: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          borderBottom: `1px solid ${brmsTheme.colors.lightBorder}`,
          flexShrink: 0,
          backgroundColor: brmsTheme.colors.white,
        }}
      >
        {/* Top Row - Back Button & Project Name */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {onBackClick && (
            <IconButton
              size="small"
              onClick={onBackClick}
              sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              backgroundColor: brmsTheme.colors.primaryGlowSoft,
              color: brmsTheme.colors.primary,
              transition: 'all 0.2s',
              flexShrink: 0,
              '&:hover': {
                backgroundColor: brmsTheme.colors.primaryGlowMid,
                transform: 'translateX(-2px)',
              },
            }}
            >
              <ArrowBackIcon sx={{ fontSize: 18 }} />
            </IconButton>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 0 }}>
            <AccountTree sx={{ fontSize: 20, color: brmsTheme.colors.primary, flexShrink: 0 }} />
            <Typography 
              sx={{
                color: brmsTheme.colors.lightTextHigh,
                fontSize: '0.9375rem',
                fontWeight: 600,
                fontFamily: brmsTheme.fonts.sans,
                letterSpacing: '-0.01em',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              Repository Tree
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Rules Label */}
      <Box
        sx={{
          px: 2.5,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: brmsTheme.colors.surfaceBase,
          borderBottom: `1px solid ${brmsTheme.colors.lightBorder}`,
        }}
      >
        <Typography
          sx={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: brmsTheme.colors.lightTextMid,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontFamily: brmsTheme.fonts.sans,
          }}
        >
          {projectName}
        </Typography>
      </Box>

      {/* Repo Tree  */}
      <Box 
        sx={{ 
          flex: 1, 
          overflowY: 'auto',
          backgroundColor: brmsTheme.colors.white,
          minHeight: 0,
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: brmsTheme.colors.lightBorder,
            borderRadius: '3px',
            '&:hover': {
              background: brmsTheme.colors.lightBorderHover,
            },
          },
        }}
      >
        {items.length > 0 ? (
          <RepoTree
            items={items}
            selectedId={selectedId}
            expandedFolders={expandedFolders}
            onToggleFolder={onToggleFolder}
            onSelectItem={onSelectItem}
            onDragStart={onDragStart}
            onDropOnFolder={onDropOnFolder}
          />
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: 1.5,
              px: 3,
              py: 6,
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                backgroundColor: brmsTheme.colors.lightSurfaceHover,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FolderOutlinedIcon sx={{ fontSize: 24, color: brmsTheme.colors.neutralGray }} />
            </Box>
            <Typography
              sx={{
                color: brmsTheme.colors.lightTextHigh,
                fontSize: '0.875rem',
                fontWeight: 600,
                fontFamily: brmsTheme.fonts.sans,
                textAlign: 'center',
              }}
            >
              No rules found
            </Typography>
            <Typography
              sx={{
                color: brmsTheme.colors.lightTextMid,
                fontSize: '0.8125rem',
                fontFamily: brmsTheme.fonts.sans,
                textAlign: 'center',
                lineHeight: 1.5,
              }}
            >
              Create your first rule to get started
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
