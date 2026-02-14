'use client';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { brmsTheme } from 'app/src/core/theme/brmsTheme';
import { RcCard } from 'app/src/core/components/RcCard';
import { verticalsApi, VerticalView } from '../api/verticalsApi';

export default function VerticalSelectionComponent() {
  const navigate = useNavigate();
  const [verticals, setVerticals] = useState<VerticalView[]>([]);

  useEffect(() => {
    // Fetch verticals from API
    verticalsApi
      .getVerticalsView()
      .then((data) => {
        setVerticals(data);
      })
      .catch((error) => {
        console.error('Error fetching verticals:', error);
      });
  }, []);

  const handleCardClick = (item: VerticalView) => {
    navigate(`/vertical/${item.id}/dashboard`, { state: { verticalName: item.vertical_name } });
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
        {verticals.map((item, index) => (
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
              {item.vertical_name}
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