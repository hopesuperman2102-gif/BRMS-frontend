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
    navigate(`/vertical/${item.vertical_key}/dashboard`, { state: { verticalName: item.vertical_name } });
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
              border: 'none',
              borderRadius: '20px',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: brmsTheme.gradients.primary,
                transform: 'scaleX(0)',
                transformOrigin: 'left',
                transition: 'transform 0.4s ease',
              },
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 20px 40px rgba(101, 82, 208, 0.2)',
                '&::before': {
                  transform: 'scaleX(1)',
                },
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

            {/* Bottom accent */}
            <Box
              sx={{
                mt: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Box
                sx={{
                  flex: 1,
                  height: 2,
                  borderRadius: 2,
                  background: `linear-gradient(90deg, ${brmsTheme.colors.primary}40 0%, transparent 100%)`,
                }}
              />
              <Box
                component="span"
                sx={{
                  color: brmsTheme.colors.primary,
                  fontSize: '1.2rem',
                  transition: 'transform 0.3s ease',
                  '.MuiCard-root:hover &': {
                    transform: 'translateX(4px)',
                  },
                }}
              >
                →
              </Box>
            </Box>
          </RcCard>
        ))}
      </Box>
    </Box>
  );
}