'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import { RcCard } from 'app/src/core/components/RcCard';
import { DeploymentHealth } from '../types/featureFlagTypes';

interface DeploymentHealthCardProps {
  title: string;
  health: DeploymentHealth;
  delay?: number;
}

export const DeploymentHealthCard: React.FC<DeploymentHealthCardProps> = ({
  title,
  health,
  delay = 0.1,
}) => {
  const { total, pending, approved, rejected } = health;

  const size = 128;
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const segments = [
    { label: 'Pending', value: pending, color: '#1976d2' },
    { label: 'Approved', value: approved, color: '#2e7d32' },
    { label: 'Rejected', value: rejected, color: '#d32f2f' },
  ];

  let offset = 0;

  return (
    <RcCard delay={delay}>
      {/* Title */}
      <Typography
        variant="subtitle2"
        sx={{
          mb: 2,
          textTransform: 'uppercase',
          color: 'text.secondary',
          fontWeight: 600,
          letterSpacing: '0.05em',
        }}
      >
        {title}
      </Typography>

      {/* Segmented Circle */}
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Box sx={{ width: size, height: size }}>
          <svg width={size} height={size}>
            {/* Segments */}
            <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
                {segments.map((segment, index) => {
                const pct = total > 0 ? segment.value / total : 0;
                const dash = pct * circumference;
                const gap = circumference - dash;

                const circle = (
                    <circle
                    key={index}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={segment.color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${dash} ${gap}`}
                    strokeDashoffset={offset}
                    />
                );

                offset -= dash;
                return circle;
                })}
            </g>

            {/* Center total */}
            <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="28"
                fontWeight="700"
                fill="#1f2937"
            >
                {total}
            </text>
            </svg>

        </Box>
      </Box>

      {/* Legend / Stats */}
      <Box
        sx={{
          mt: 2,
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 2,
        }}
      >
        {segments.map((segment) => (
          <Box key={segment.label} sx={{ textAlign: 'right' }}>
            <Typography
              variant="caption"
              sx={{ color: segment.color, fontWeight: 600 }}
            >
              {segment.label}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {segment.value}
            </Typography>
          </Box>
        ))}
      </Box>
    </RcCard>
  );
};
