// app/src/modules/feature-flags/components/FeatureFlagHeader.tsx

'use client';

import React from 'react';
import { Box, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import { Environment } from '../types/featureFlagTypes';
import { RcCard } from 'app/src/core/components/RcCard';
import Dropdown from 'app/src/core/components/Dropdown';
import { projectItems } from '../mock_data';


interface FeatureFlagHeaderProps {
  totalRules: number;
  environments: Environment[];
  activeEnvironment?: Environment;
  onEnvironmentClick?: (env: Environment) => void;
}

export const FeatureFlagHeader: React.FC<FeatureFlagHeaderProps> = ({
  totalRules,
  environments,
  activeEnvironment,
  onEnvironmentClick
}) => {
  void activeEnvironment;
  const getEnvColor = (env: Environment) => {
    if (env === 'PROD') return { bgcolor: 'error.main', color: 'white' };
    if (env === 'QA') return { bgcolor: 'primary.main', color: 'white' };
    return { bgcolor: 'grey.300', color: 'grey.700' };
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
                background: 'linear-gradient(135deg, #6552D0 0%, #17203D 100%)',
                color: 'white',
                fontWeight: 700,
                px: 2,
                py: 2.5,
                fontSize: '0.95rem',
                boxShadow: 2
              }}
            />
          </motion.div>
          
          <Dropdown
            label="Project"
            items={projectItems}
            onSelect={() => {
            }}
          />
        </Box>

        {/* Right Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {environments.map((env) => (
            <motion.div key={env} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Chip
                label={env === 'PROD' ? '●' : env}
                onClick={() => onEnvironmentClick?.(env)}
                sx={{
                  ...getEnvColor(env),
                  fontWeight: 700,
                  minWidth: 48,
                  height: 48,
                  borderRadius: '50%',
                  cursor: 'pointer',
                  boxShadow: 1,
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