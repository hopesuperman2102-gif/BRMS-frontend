'use client';

import React from 'react';
import { Paper, Typography, Box, styled } from '@mui/material';
import { motion } from 'framer-motion';
import { brmsTheme } from '@/core/theme/brmsTheme';
import { CardHeaderProps, CardProps } from '@/core/types/commonTypes';

const MotionPaper = motion(Paper);

const StyledPaper = styled(Paper)({
  padding: 24,
  borderRadius: 16,
  backgroundColor: brmsTheme.colors.white,
  backdropFilter: 'blur(20px)',
  border: `1px solid ${brmsTheme.colors.lightBorder}`,
});

const StyledMotionPaper = styled(MotionPaper)({
  padding: 24,
  borderRadius: 16,
  backgroundColor: brmsTheme.colors.white,
  backdropFilter: 'blur(20px)',
  border: `1px solid ${brmsTheme.colors.lightBorder}`,
});

const CardHeaderBox = styled(Box)({
  marginBottom: 24,
});

const CardTitle = styled(Typography)({
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: 'text.primary',
});

const CardSubtitle = styled(Typography)({
  marginTop: 4,
});

export const RcCard: React.FC<CardProps> = ({
  children,
  className = '',
  delay = 0,
  animate = true,
  sx = {},
  onClick,
}) => {
  const animationProps = animate
    ? {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { delay },
      }
    : {};

  if (animate) {
    return (
      <StyledMotionPaper
        {...animationProps}
        elevation={2}
        onClick={onClick}
        sx={sx}
        className={className}
      >
        {children}
      </StyledMotionPaper>
    );
  }

  return (
    <StyledPaper
      elevation={2}
      onClick={onClick}
      sx={sx}
      className={className}
    >
      {children}
    </StyledPaper>
  );
};

export const CardHeader: React.FC<CardHeaderProps> = ({ title, subtitle }) => {
  return (
    <CardHeaderBox>
      <CardTitle variant="h6">
        {title}
      </CardTitle>
      {subtitle && (
        <CardSubtitle variant="body2" color="text.secondary">
          {subtitle}
        </CardSubtitle>
      )}
    </CardHeaderBox>
  );
};