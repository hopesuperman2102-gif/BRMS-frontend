import React from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { RcLogLevelStatsProps } from '../types/commonTypes';

const StatsGroup = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 6,
});

const LabelText = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'fontfamily' && prop !== 'textcolor',
})<{ fontfamily: string; textcolor: string }>(({ fontfamily, textcolor }) => ({
  fontSize: 10,
  color: textcolor,
  fontFamily: fontfamily,
  marginRight: 4,
}));

const StatPill = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'background' && prop !== 'border' && prop !== 'compact',
})<{ background: string; border: string; compact: boolean }>(({ background, border, compact }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  padding: compact ? '3px 7px' : '3px 8px',
  borderRadius: compact ? 999 : 5,
  background,
  border: `1px solid ${border}`,
}));

const StatDot = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'dotcolor',
})<{ dotcolor: string }>(({ dotcolor }) => ({
  width: 5,
  height: 5,
  borderRadius: '50%',
  background: dotcolor,
  flexShrink: 0,
}));

const CountText = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'textcolor' && prop !== 'fontfamily',
})<{ textcolor: string; fontfamily: string }>(({ textcolor, fontfamily }) => ({
  fontSize: 10,
  fontWeight: 800,
  color: textcolor,
  fontFamily: fontfamily,
  fontVariantNumeric: 'tabular-nums',
}));

const LevelText = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'textcolor' && prop !== 'fontfamily' && prop !== 'compact',
})<{ textcolor: string; fontfamily: string; compact: boolean }>(({ textcolor, fontfamily, compact }) => ({
  fontSize: 10,
  color: textcolor,
  fontFamily: fontfamily,
  opacity: compact ? 1 : 0.8,
}));

function RcLogLevelStats({
  items,
  label,
  labelColor = '#9ca3af',
  compact = false,
  showDot = false,
  fontFamily = 'monospace',
}: RcLogLevelStatsProps) {
  return (
    <StatsGroup>
      {label ? <LabelText fontfamily={fontFamily} textcolor={labelColor}>{label}</LabelText> : null}
      {items.map((item) => (
        <StatPill key={item.key} background={item.background} border={item.border} compact={compact}>
          {showDot ? <StatDot dotcolor={item.color} /> : null}
          {compact ? (
            <LevelText textcolor={item.color} fontfamily={fontFamily} compact={compact}>
              {item.label} {item.count}
            </LevelText>
          ) : (
            <>
              <CountText textcolor={item.color} fontfamily={fontFamily}>{item.count}</CountText>
              <LevelText textcolor={item.color} fontfamily={fontFamily} compact={compact}>{item.label}</LevelText>
            </>
          )}
        </StatPill>
      ))}
    </StatsGroup>
  );
}

export default RcLogLevelStats;
