'use client';

import { Box, Typography, IconButton, InputBase} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import { RepositorySidebarProps } from '../types/commonTypes';
import RepoTree from './RepoTree';
import AccountTree from '@mui/icons-material/AccountTree';

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
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
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
          borderBottom: '1px solid #e5e7eb',
          flexShrink: 0,
          backgroundColor: '#ffffff',
        }}
      >
        {/* Top Row - Back Button & Project Name */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {onBackClick && (
            <IconButton
              size="small"
              onClick={onBackClick}
              sx={{
                width: 32,
                height: 32,
                color: '#6b7280',
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                '&:hover': { 
                  backgroundColor: '#f3f4f6',
                  borderColor: '#d1d5db',
                },
                transition: 'all 0.15s ease',
              }}
            >
              <ArrowBackIcon sx={{ fontSize: 18 }} />
            </IconButton>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 0 }}>
            <AccountTree sx={{ fontSize: 20, color: '#3b82f6', flexShrink: 0 }} />
            <Typography 
              sx={{
                color: '#111827',
                fontSize: '0.9375rem',
                fontWeight: 600,
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                letterSpacing: '-0.01em',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {projectName}
            </Typography>
          </Box>
        </Box>

        {/* Search Bar */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            px: 1.5,
            py: 0.75,
            transition: 'all 0.15s ease',
            '&:focus-within': {
              backgroundColor: '#ffffff',
              borderColor: '#3b82f6',
              boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
            },
            '&:hover': {
              borderColor: '#d1d5db',
            },
          }}
        >
          <SearchIcon sx={{ fontSize: 18, color: '#9ca3af', mr: 1 }} />
          <InputBase
            placeholder="Search rules..."
            sx={{
              flex: 1,
              fontSize: '0.8125rem',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              color: '#111827',
              '& input::placeholder': {
                color: '#9ca3af',
                opacity: 1,
              },
            }}
          />
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
          backgroundColor: '#fafafa',
          borderBottom: '1px solid #e5e7eb',
        }}
      >
        <Typography
          sx={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#6b7280',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          Rules
        </Typography>
        <Typography
          sx={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#9ca3af',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          {items.length}
        </Typography>
      </Box>

      {/* Repo Tree */}
      <Box 
        sx={{ 
          flex: 1, 
          overflowY: 'auto',
          backgroundColor: '#ffffff',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#e5e7eb',
            borderRadius: '3px',
            '&:hover': {
              background: '#d1d5db',
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
                backgroundColor: '#f3f4f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FolderOutlinedIcon sx={{ fontSize: 24, color: '#9ca3af' }} />
            </Box>
            <Typography
              sx={{
                color: '#111827',
                fontSize: '0.875rem',
                fontWeight: 600,
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                textAlign: 'center',
              }}
            >
              No rules found
            </Typography>
            <Typography
              sx={{
                color: '#6b7280',
                fontSize: '0.8125rem',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
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