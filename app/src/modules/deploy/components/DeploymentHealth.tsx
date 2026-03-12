'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { RcCard } from '@/core/components/RcCard';
import { DeploymentHealthProps } from '@/modules/deploy/types/deployTypes';
import { brmsTheme } from '@/core/theme/brmsTheme';

const Title = styled(Typography)({
  marginBottom: 16,
  textTransform: 'uppercase',
  color: 'text.secondary',
  fontWeight: 600,
  letterSpacing: '0.05em',
});

const ChartWrapper = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
});

const ChartBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'size',
})<{ size: number }>(({ size }) => ({
  width: size,
  height: size,
}));

const Legend = styled(Box)({
  marginTop: 16,
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 16,
});

const LegendItem = styled(Box)({
  textAlign: 'right',
});

const LegendValue = styled(Typography)({
  fontWeight: 700,
});

export const DeploymentHealth: React.FC<DeploymentHealthProps> = ({
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
    { label: 'Pending', value: pending, color: brmsTheme.colors.info },
    { label: 'Approved', value: approved, color: brmsTheme.colors.success },
    { label: 'Rejected', value: rejected, color: brmsTheme.colors.error },
  ];

  let offset = 0;

  return (
    <RcCard delay={delay}>
      <Title variant="subtitle2">{title}</Title>

      <ChartWrapper>
        <ChartBox size={size}>
          <svg width={size} height={size}>
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

            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="28"
              fontWeight="700"
              fill={brmsTheme.colors.textPrimary}
            >
              {total}
            </text>
          </svg>
        </ChartBox>
      </ChartWrapper>

      <Legend>
        {segments.map((segment) => (
          <LegendItem key={segment.label}>
            <Typography variant="caption" style={{ color: segment.color, fontWeight: 600 }}>
              {segment.label}
            </Typography>
            <LegendValue variant="body2">{segment.value}</LegendValue>
          </LegendItem>
        ))}
      </Legend>
    </RcCard>
  );
};

