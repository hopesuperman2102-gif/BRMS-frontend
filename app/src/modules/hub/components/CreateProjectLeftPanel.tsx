'use client';

import RcLeftPanel from 'app/src/core/components/RcLeftPanel';
import { CreateProjectLeftPanelProps } from '../types/hubTypes';

export default function CreateProjectLeftPanel({
  isEditMode,
  onBack,
}: CreateProjectLeftPanelProps) {
  return (
    <RcLeftPanel
      variant="create"
      backLabel="Hub"
      onBack={onBack}
      badge={isEditMode ? 'Editing · Project' : 'New · Project'}
      headline={isEditMode ? 'Refine your\nproject.' : 'Build something\nremarkable.'}
      heroCopy={
        isEditMode
          ? 'Update your project details to keep your team aligned and rules organized.'
          : 'Projects are the foundation of rule management. Define scope, structure your team, and ship.'
      }
      features={[
        'Organize rules into structured folders',
        'Version control & deployment tracking',
        'Cross-team collaboration & access control',
      ]}
    />
  );
}