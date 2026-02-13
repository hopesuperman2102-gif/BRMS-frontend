// app/src/modules/feature-flags/components/ui/BarChart.tsx

'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { RuleChange } from 'app/src/modules/deploy/types/featureFlagTypes';


interface BarChartProps {
  data: RuleChange[];
  height?: number;
}

export const BarChart: React.FC<BarChartProps> = ({ data, height = 96 }) => {
  const colors = ['#60a5fa', '#fbbf24', '#60a5fa', '#fb7185'];
  const maxCount = Math.max(...data.map(d => d.count));

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 1, height: `${height}px` }}>
        {data.map((item, idx) => {
          const barHeight = (item.count / maxCount) * 100;
          return (
            <motion.div
              key={idx}
              initial={{ height: 0 }}
              animate={{ height: `${barHeight}%` }}
              transition={{ delay: 0.5 + idx * 0.1, duration: 0.5 }}
              style={{
                flex: 1,
                borderRadius: '8px 8px 0 0',
                backgroundColor: colors[idx % colors.length],
                minHeight: '20px'
              }}
              title={`${item.version}: ${item.count} changes`}
            />
          );
        })}
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
        {data.map((item, idx) => (
          <Typography key={idx} variant="caption" color="text.secondary" sx={{ flex: 1, textAlign: 'center' }}>
            {item.version}
          </Typography>
        ))}
      </Box>
    </Box>
  );
};