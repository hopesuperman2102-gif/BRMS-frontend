// VerticalSelectionComponent.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, styled } from '@mui/material';
import { verticalsApi, VerticalView } from '../api/verticalsApi';
import { brmsTheme } from 'app/src/core/theme/brmsTheme';
import VerticalRightPanel from '../components/VerticalRightPanel';
import VerticalLeftPanel from '../components/VerticalLeftPanel';


const MainContainer = styled(Box)({
  height: '100vh',
  width: '100%',
  display: 'flex',
  overflow: 'hidden',
  background: brmsTheme.colors.bgRoot,
  fontFamily: brmsTheme.fonts.sans,
});

export default function VerticalSelectionPage() {
  const navigate = useNavigate();
  const [verticals, setVerticals] = useState<VerticalView[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  useEffect(() => {
    verticalsApi
      .getVerticalsView()
      .then((data) => setVerticals(data))
      .catch((error) => console.error('Error fetching verticals:', error))
      .finally(() => setLoading(false));
  }, []);

  const handleCardClick = (item: VerticalView) => {
    navigate(`/vertical/${item.vertical_key}/dashboard`, { 
      state: { verticalName: item.vertical_name } 
    });
  };

  const handleCardHover = (key: string | null) => {
    setHoveredKey(key);
  };

  return (
    <MainContainer>
      <VerticalLeftPanel 
        verticalCount={verticals.length} 
        loading={loading} 
      />
      <VerticalRightPanel
        verticals={verticals}
        loading={loading}
        hoveredKey={hoveredKey}
        onCardHover={handleCardHover}
        onCardClick={handleCardClick}
      />
    </MainContainer>
  );
}
