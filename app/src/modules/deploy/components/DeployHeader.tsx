'use client';

import React from 'react';
import { Box, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import { RcCard } from 'app/src/core/components/RcCard';
import { brmsTheme } from 'app/src/core/theme/brmsTheme';
import { DeployHeaderProps, Environment } from '../types/featureFlagTypes';
import RcDropdown from 'app/src/core/components/RcDropdown';

export const DeployHeader: React.FC<DeployHeaderProps> = ({
  totalRules,
  projectItems,
  selectedProject,
  onProjectSelect,
  environments,
  activeEnvironment,
  onEnvironmentClick
}) => {
  const getEnvColor = (env: string) => {
    if (env === 'PROD') return { bgcolor: brmsTheme.colors.envProd, color: brmsTheme.colors.white };
    if (env === 'QA') return { bgcolor: brmsTheme.colors.envQa, color: brmsTheme.colors.white };
    if (env === 'ALL') return { bgcolor: brmsTheme.colors.envAll, color: brmsTheme.colors.white };
    return { bgcolor: brmsTheme.colors.envDefault, color: brmsTheme.colors.white };
  };

  return (
    <RcCard delay={0} sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Left Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <motion.div whileHover={{ scale: 1.05 }}>
            <Chip
              label={`TOTAL RULES: ${totalRules.toLocaleString()}`}
              sx={{
                background: brmsTheme.gradients.primary,
                color: brmsTheme.colors.textOnPrimary,
                fontWeight: 700,
                px: 2,
                py: 2.5,
                fontSize: '0.95rem',
                boxShadow: 2
              }}
            />
          </motion.div>
          
          <RcDropdown
            label={selectedProject}
            items={projectItems}
            onSelect={onProjectSelect}
          />
        </Box>

        {/* Right Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {(['ALL', ...environments] as string[]).map((env) => (
            <motion.div key={env} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Chip
                label={env === 'PROD' ? '●' : env}
                onClick={() => onEnvironmentClick?.(env as Environment | 'ALL')}
                sx={{
                  ...getEnvColor(env),
                  fontWeight: 700,
                  minWidth: 48,
                  height: 48,
                  borderRadius: '50%',
                  cursor: 'pointer',
                  boxShadow: activeEnvironment === env ? 4 : 1,
                  outline: activeEnvironment === env ? `3px solid ${brmsTheme.colors.deployTabOutline}` : 'none',
                  outlineOffset: '2px',
                  '&:hover': {
                    boxShadow: 3
                  }
                }}
              />
            </motion.div>
          ))}
        </Box>
      </Box>
    </RcCard>
  );
};
