'use client';

import AccountTree from '@mui/icons-material/AccountTree';
import { styled } from '@mui/material';
import { brmsTheme } from '@/core/theme/brmsTheme';
import { ProjectListLeftPanelProps } from '@/modules/hub/types/hubTypes';
import RcLeftPanel from '@/core/components/RcLeftPanel';

const { colors } = brmsTheme;

const PanelIcon = styled(AccountTree)({
  fontSize: 18,
  color: colors.textOnPrimary,
  opacity: 0.85,
});

export default function ProjectListLeftPanel({
  projects,
  hoveredProject,
}: ProjectListLeftPanelProps) {
  return (
    <RcLeftPanel
      variant="list"
      icon={<PanelIcon />}
      title="Projects"
      subtitle="Manage and organize your rule projects across teams and domains."
      stats={[{ label: 'Total projects', value: projects.length }]}
      preview={
        hoveredProject
          ? {
              name: hoveredProject.name,
              description: hoveredProject.description || 'No description provided for this project.',
              tag: hoveredProject.domain,
            }
          : null
      }
      placeholderText="Hover a project to see its details here."
    />
  );
}