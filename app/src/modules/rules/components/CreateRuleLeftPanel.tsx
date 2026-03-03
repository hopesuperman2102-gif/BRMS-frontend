'use client';

import RcLeftPanel from '@/core/components/RcLeftPanel';
import { CreateRuleLeftPanelProps } from '@/modules/rules/types/rulesTypes';

export default function CreateRuleLeftPanel({ isEditMode, onBack }: CreateRuleLeftPanelProps) {
  return (
    <RcLeftPanel
      variant="create"
      backLabel="Rules"
      onBack={onBack}
      badge={isEditMode ? 'Editing · Rule' : 'New · Rule'}
      headline={isEditMode ? 'Refine your\nrule.' : 'Define your\nlogic.'}
      heroCopy={
        isEditMode
          ? 'Update your rule details to keep your decision logic accurate and your team aligned.'
          : 'Rules are the building blocks of your decision engine. Name it, describe it, and place it.'
      }
      features={[
        'Folder-based rule organisation',
        'Full path tracking & versioning',
        'Plugs into your JDM decision graph',
      ]}
    />
  );
}
