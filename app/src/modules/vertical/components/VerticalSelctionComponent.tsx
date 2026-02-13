'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import { brmsTheme } from 'app/src/core/theme/brmsTheme';
import { RcCard } from 'app/src/core/components/RcCard';

// Just add or remove titles here
const mockTitles = [
  'Login Feature',
  'Payment Gateway',
  'Redesign',
  'Live Chat',
  'Email Notifications',
  'Dark Mode',
  'User Roles',
  'Reports Module',
  'Multi Tenant Support',
  'Audit Logs',
  'API Rate Limiting',
  'File Upload',
  'User Roles',
  'Reports Module',
  'Multi Tenant Support',
  'Audit Logs',
];

// Automatically convert titles into card data
const mockData = mockTitles.map((title, index) => ({
  name: title,
  id: index, // Add unique id for key prop
}));

export default function VerticalSelectionComponent() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: '#F6F7FB',
        px: { xs: 3, sm: 6 },
        py: 8,
      }}
    >
      {/* Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: '1fr 1fr',
            lg: '1fr 1fr 1fr',
          },
          gap: 4,
          maxWidth: 1400,
          mx: 'auto',
        }}
      >
        {mockData.map((item) => (
          <RcCard
            key={item.id}
            delay={item.id * 0.03}
            sx={{
              background: '#ffffff',
              border: `1px solid rgba(101, 82, 208, 0.1)`,
              transition: 'all 0.3s ease',
              cursor: 'pointer',

              '&:hover': {
                boxShadow: brmsTheme.shadows.primaryHover,
                transform: 'translateY(-6px)',
                borderColor: brmsTheme.colors.primary,
              },
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                mb: 2,
                color: brmsTheme.colors.primaryDark,
              }}
            >
              {item.name}
            </Typography>


            <Box
              sx={{
                mt: 4,
                height: 6,
                borderRadius: 3,
                background: brmsTheme.gradients.primary,
              }}
            />
          </RcCard>
        ))}
      </Box>
    </Box>
  );
}