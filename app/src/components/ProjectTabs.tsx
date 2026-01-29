'use client';

import { styled } from '@mui/material/styles';
import { Box, Chip, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { ProjectTabsProps } from './types';

/* ---------------- styled ---------------- */

const TabsWrapper = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '8px 12px',
  borderBottom: '1px solid #e5e7eb',
  backgroundColor: '#ffffff',
  overflowX: 'auto',
  overflowY: 'hidden',
  whiteSpace: 'nowrap',
  flexShrink: 0, // Prevents the tabs container from shrinking
  minHeight: 48, // Fixed height to prevent layout shifts

  // Hide scrollbar for all browsers
  scrollbarWidth: 'none', // Firefox
  msOverflowStyle: 'none', // IE and Edge
  '&::-webkit-scrollbar': {
    display: 'none', // Chrome, Safari, Opera
  },
}));

const ProjectChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== 'active',
})<{ active?: boolean }>(({ active }) => ({
  height: 32,
  borderRadius: 8,
  paddingLeft: 4,
  paddingRight: 4,
  fontSize: 13,
  fontWeight: 500,
  backgroundColor: active ? '#eef2ff' : '#f8fafc',
  border: active ? '1px solid #6366f1' : '1px solid #e5e7eb',
  color: active ? '#4f46e5' : '#111827',
  flexShrink: 0, // Prevents chips from shrinking

  '& .MuiChip-icon': {
    color: active ? '#4f46e5' : '#6b7280',
  },

  '&:hover': {
    backgroundColor: active ? '#e0e7ff' : '#f1f5f9',
  },

  // Prevent text from wrapping
  '& .MuiChip-label': {
    paddingLeft: 8,
    paddingRight: 8,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: 150, // Optional: limit tab width
  },
}));

/* ---------------- component ---------------- */

export default function ProjectTabs({
  projects,
  activeProjectId,
  onSelect,
  onClose,
}: ProjectTabsProps) {
  if (projects.length === 0) return null;

  return (
    <TabsWrapper>
      {projects.map((project) => {
        const active = project.id === activeProjectId;

        return (
          <ProjectChip
            key={project.id}
            active={active}
            icon={<InsertDriveFileIcon fontSize="small" />}
            label={project.name}
            onClick={() => onSelect(project.id)}
            deleteIcon={
              <IconButton size="small">
                <CloseIcon fontSize="small" />
              </IconButton>
            }
            onDelete={() => onClose(project.id)}
          />
        );
      })}
    </TabsWrapper>
  );
}