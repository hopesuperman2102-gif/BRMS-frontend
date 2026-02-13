// app/src/modules/feature-flags/components/ui/Card.tsx

'use client';

import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  animate?: boolean;
  sx?: SxProps<Theme>;
}

// Pre-create motion component to avoid creating components during render
const MotionPaper = motion(Paper);

export const RcCard: React.FC<CardProps> = ({
  children,
  className = '',
  delay = 0,
  animate = true,
  sx = {},
}) => {
  const Component = animate ? MotionPaper : Paper;

  const animationProps = animate
    ? {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { delay },
      }
    : {};

  return (
    <Component
      {...animationProps}
      elevation={2}
      sx={{
        p: 3,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        ...sx,
      }}
      className={className}
    >
      {children}
    </Component>
  );
};

interface CardHeaderProps {
  title: string;
  subtitle?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ title, subtitle }) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography 
        variant="h6" 
        sx={{ 
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'text.primary'
        }}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  );
};



