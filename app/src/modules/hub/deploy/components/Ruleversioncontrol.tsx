// app/src/modules/feature-flags/components/RuleVersionControl.tsx

'use client';

import React from 'react';
import { Box, Checkbox, Typography, Divider } from '@mui/material';
import { motion } from 'framer-motion';

import { Rule } from '../types/featureFlagTypes';
import { RcCard, CardHeader } from 'app/src/core/components/RcCard';
import Dropdown from 'app/src/core/components/Dropdown';
import { projectItems } from '../mock_data';

interface RuleVersionControlProps {
  rules: Rule[];
  selectedRules: Set<string>;
  onToggleRule: (ruleId: string) => void;
  delay?: number;
}

export const RuleVersionControl: React.FC<RuleVersionControlProps> = ({
  rules,
  selectedRules,
  onToggleRule,
  delay = 0.5
}) => {
  return (
    <RcCard delay={delay}>
      <CardHeader title="Rule & Version Control" />
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {rules.map((rule, idx) => (
          <motion.div
            key={rule.id ?? `rule-${idx}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + idx * 0.1 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Checkbox
                checked={selectedRules.has(rule.id)}
                onChange={() => onToggleRule(rule.id)}
                sx={{ mt: -0.5 }}
              />
              
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body1" fontWeight={500}>
                    {rule.name}
                  </Typography>
                  
                  {rule.status === 'veatus' && (
                    <Dropdown
                        label="Project"
                        items={projectItems}
                        onSelect={() => {
                        }}
                    />
                  )}
                  
                  {rule.status === 'pending' && (
                    <Dropdown
                        label="Project"
                        items={projectItems}
                        onSelect={() => {
                        }}
                    />
                  )}
                  
                  {rule.status === 'active' && rule.version && (
                    <Dropdown
                        label="Project"
                        items={projectItems}
                        onSelect={() => {
                        }}
                    />
                  )}
                </Box>
              </Box>
            </Box>
          </motion.div>
        ))}
      </Box>

      <Divider sx={{ my: 3 }} />
    </RcCard>
  );
};