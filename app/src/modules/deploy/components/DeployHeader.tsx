'use client';

import React from 'react';
import { Box, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { RcCard } from '@/core/components/RcCard';
import { brmsTheme } from '@/core/theme/brmsTheme';
import { DeployHeaderProps, Environment } from '@/modules/deploy/types/deployTypes';
import RcDropdown from '@/core/components/RcDropdown';

const HeaderCard = styled(RcCard)({
  marginBottom: 24,
});

const HeaderRow = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

const HeaderSection = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 16,
});

const EnvironmentSection = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
});

const TotalRulesChip = styled(Chip)({
  background: brmsTheme.gradients.primary,
  color: brmsTheme.colors.textOnPrimary,
  fontWeight: 700,
  paddingLeft: 16,
  paddingRight: 16,
  paddingTop: 20,
  paddingBottom: 20,
  fontSize: '0.95rem',
  boxShadow: '0px 1px 5px rgba(0,0,0,0.2)',
});

const EnvironmentChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== 'isActive' && prop !== 'envbg' && prop !== 'envcolor',
})<{ isActive: boolean; envbg: string; envcolor: string }>(({ isActive, envbg, envcolor }) => ({
  backgroundColor: envbg,
  color: envcolor,
  fontWeight: 700,
  minWidth: 48,
  height: 48,
  borderRadius: '50%',
  cursor: 'pointer',
  boxShadow: isActive ? '0px 4px 8px rgba(0,0,0,0.25)' : '0px 1px 3px rgba(0,0,0,0.2)',
  outline: isActive ? `3px solid ${brmsTheme.colors.deployTabOutline}` : 'none',
  outlineOffset: '2px',
  '&:hover': {
    boxShadow: '0px 3px 6px rgba(0,0,0,0.24)',
  },
}));

export const DeployHeader: React.FC<DeployHeaderProps> = ({
  totalRules,
  projectItems,
  selectedProject,
  onProjectSelect,
  environments,
  activeEnvironment,
  onEnvironmentClick,
}) => {
  const getEnvColor = (env: string) => {
    if (env === 'PROD') return { bgcolor: brmsTheme.colors.envProd, color: brmsTheme.colors.white };
    if (env === 'QA') return { bgcolor: brmsTheme.colors.envQa, color: brmsTheme.colors.white };
    if (env === 'ALL') return { bgcolor: brmsTheme.colors.envAll, color: brmsTheme.colors.white };
    return { bgcolor: brmsTheme.colors.envDefault, color: brmsTheme.colors.white };
  };

  return (
    <HeaderCard delay={0}>
      <HeaderRow>
        <HeaderSection>
          <motion.div whileHover={{ scale: 1.05 }}>
            <TotalRulesChip label={`TOTAL RULES: ${totalRules.toLocaleString()}`} />
          </motion.div>

          <RcDropdown label={selectedProject} items={projectItems} onSelect={onProjectSelect} />
        </HeaderSection>

        <EnvironmentSection>
          {(['ALL', ...environments] as string[]).map((env) => {
            const colors = getEnvColor(env);
            return (
              <motion.div key={env} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <EnvironmentChip
                  label={env === 'PROD' ? '?' : env}
                  onClick={() => onEnvironmentClick?.(env as Environment | 'ALL')}
                  isActive={activeEnvironment === env}
                  envbg={colors.bgcolor}
                  envcolor={colors.color}
                />
              </motion.div>
            );
          })}
        </EnvironmentSection>
      </HeaderRow>
    </HeaderCard>
  );
};
