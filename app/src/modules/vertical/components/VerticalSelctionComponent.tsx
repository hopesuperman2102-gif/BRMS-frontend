'use client';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { brmsTheme } from 'app/src/core/theme/brmsTheme';
import { RcCard } from 'app/src/core/components/RcCard';

// Mock data - this will come from backend
const mockData = [
  { id: 'vertical-1', name: 'Login Feature' },
  { id: 'vertical-2', name: 'Payment Gateway' },
  { id: 'vertical-3', name: 'Redesign' },
  { id: 'vertical-4', name: 'Live Chat' },
  { id: 'vertical-5', name: 'Email Notifications' },
  { id: 'vertical-6', name: 'Dark Mode' },
  { id: 'vertical-7', name: 'User Roles' },
  { id: 'vertical-8', name: 'Reports Module' },
  { id: 'vertical-9', name: 'Multi Tenant Support' },
  { id: 'vertical-10', name: 'Audit Logs' },
  { id: 'vertical-11', name: 'API Rate Limiting' },
  { id: 'vertical-12', name: 'File Upload' },
  { id: 'vertical-13', name: 'User Roles' },
  { id: 'vertical-14', name: 'Reports Module' },
  { id: 'vertical-15', name: 'Multi Tenant Support' },
  { id: 'vertical-16', name: 'Audit Logs' },
];

export default function VerticalSelectionComponent() {
  const navigate = useNavigate();

  const handleCardClick = (item: { name: string; id: string }) => {
    navigate(`/vertical/${item.id}/dashboard`, { state: { verticalName: item.name } });
  };

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
        {mockData.map((item, index) => (
          <RcCard
            key={item.id}
            delay={index * 0.03}
            onClick={() => handleCardClick(item)}
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