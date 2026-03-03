'use client';

import AccountTree from '@mui/icons-material/AccountTree';
import { brmsTheme } from '@/core/theme/brmsTheme';
import { RulesLeftPanelProps } from '@/modules/rules/types/Explorertypes';
import RcLeftPanel from '@/core/components/RcLeftPanel';

const { colors } = brmsTheme;

export default function RulesLeftPanel({
  projectName,
  files,
  folders,
  hoveredRule,
}: RulesLeftPanelProps) {
  const totalRules   = files.length;
  const totalFolders = folders.filter((f) => !f.isTemp).length;

  return (
    <RcLeftPanel
      variant="list"
      icon={<AccountTree sx={{ fontSize: 18, color: colors.textOnPrimary, opacity: 0.85 }} />}
      title={projectName || 'Rules'}
      subtitle="Manage your decision rules, folders, and versions for this project."
      statCards={[
        { label: 'Rules',   value: totalRules },
        { label: 'Folders', value: totalFolders },
      ]}
      preview={
        hoveredRule
          ? {
              name: hoveredRule.name,
              description: hoveredRule.description || 'No description provided for this rule.',
            }
          : null
      }
      placeholderText="Hover a rule to see its details here."
    />
  );
}
