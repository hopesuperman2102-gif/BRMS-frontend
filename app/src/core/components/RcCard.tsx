// app/src/modules/feature-flags/components/ui/Card.tsx

'use client';

import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import { motion } from 'framer-motion';
import { brmsTheme } from '../theme/brmsTheme';
import { CardHeaderProps, CardProps } from '../types/commonTypes';


// Pre-create motion component to avoid creating components during render
const MotionPaper = motion(Paper);

export const RcCard: React.FC<CardProps> = ({
  children,
  className = '',
  delay = 0,
  animate = true,
  sx = {},
  onClick, // Add this line
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
      onClick={onClick} // Add this line
      sx={{
        p: 3,
        borderRadius: 4,
        backgroundColor: brmsTheme.colors.white,
        backdropFilter: 'blur(20px)',
        border: `1px solid ${brmsTheme.colors.lightBorder}`,
        ...sx,
      }}
      className={className}
    >
      {children}
    </Component>
  );
};

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