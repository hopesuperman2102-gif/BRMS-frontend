'use client';

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, styled } from '@mui/material';
import { verticalsApi } from '@/modules/vertical/api/verticalsApi';
import { brmsTheme } from '@/core/theme/brmsTheme';
import VerticalRightPanel from '@/modules/vertical/components/VerticalRightPanel';
import VerticalLeftPanel from '@/modules/vertical/components/VerticalLeftPanel';
import { VerticalView } from '@/modules/vertical/types/verticalEndpointsTypes';

const MainContainer = styled(Box)({
  flex: 1,
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

  // 🔧 NEW: Find the description of the currently hovered vertical
  const getHoveredVerticalDescription = (): string | undefined => {
    if (!hoveredKey) return undefined;
    const hovered = verticals.find((v) => v.vertical_key === hoveredKey);
    return hovered?.description;
  };

  return (
    <MainContainer>
      <VerticalLeftPanel 
        verticalCount={verticals.length} 
        loading={loading}
        selectedVerticalDescription={getHoveredVerticalDescription()}
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
