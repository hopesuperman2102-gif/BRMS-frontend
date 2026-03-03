'use client';

import AccountTree from '@mui/icons-material/AccountTree';
import { brmsTheme } from '@/core/theme/brmsTheme';
import { ProjectListLeftPanelProps } from '@/modules/hub/types/hubTypes';
import RcLeftPanel from '@/core/components/RcLeftPanel';

const { colors } = brmsTheme;

export default function ProjectListLeftPanel({
  projects,
  hoveredProject,
}: ProjectListLeftPanelProps) {
  return (
    <RcLeftPanel
      variant="list"
      icon={<AccountTree sx={{ fontSize: 18, color: colors.textOnPrimary, opacity: 0.85 }} />}
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
