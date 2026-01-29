'use client';

import { styled } from '@mui/material/styles';
import {
  Box,
  Chip,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FolderIcon from '@mui/icons-material/Folder';

type Project = {
  id: number;
  name: string;
};

type ProjectTabsProps = {
  projects: Project[];
  activeProjectId: number | null;
  onSelect: (id: number) => void;
  onClose: (id: number) => void;
};

/* ---------------- styled ---------------- */

const TabsWrapper = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '8px 12px',
  borderBottom: '1px solid #e5e7eb',
  backgroundColor: '#ffffff',
  overflowX: 'auto',
  whiteSpace: 'nowrap',

  '&::-webkit-scrollbar': {
    height: 6,
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: '#d1d5db',
    borderRadius: 4,
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

  '& .MuiChip-icon': {
    color: active ? '#4f46e5' : '#6b7280',
  },

  '&:hover': {
    backgroundColor: active ? '#e0e7ff' : '#f1f5f9',
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
            icon={<FolderIcon fontSize="small" />}
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
