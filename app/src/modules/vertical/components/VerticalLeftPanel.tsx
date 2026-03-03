'use client';

import LayersIcon from '@mui/icons-material/Layers';
import { brmsTheme } from 'app/src/core/theme/brmsTheme';
import RcLeftPanel from 'app/src/core/components/RcLeftPanel';
import { VerticalLeftPanelProps } from '../types/verticalTypes';

const DEFAULT_DESCRIPTION =
  'Each vertical is an isolated decision domain. Select one to manage its projects, rules, and deployment pipelines.';

export default function VerticalLeftPanel({
  verticalCount,
  loading,
  selectedVerticalDescription,
}: VerticalLeftPanelProps) {
  return (
    <RcLeftPanel
      variant="create"
      logo={{
        icon: <LayersIcon sx={{ fontSize: 16, color: brmsTheme.colors.indigoLight }} />,
        text: 'BRMS Platform',
      }}
      badge="Select · Vertical"
      heroCopy={selectedVerticalDescription || DEFAULT_DESCRIPTION}
      features={[
        'Isolated rule sets per business domain',
        'Independent versioning & deployment',
        'Role-based access per vertical',
      ]}
      count={
        !loading
          ? { value: verticalCount, label: 'vertical' }
          : undefined
      }
    />
  );
}