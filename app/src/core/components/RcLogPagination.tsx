import React from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { RcLogPaginationPalette, RcLogPaginationProps } from '../types/commonTypes';

const PagerGroup = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 5,
});

const PageList = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 3,
});

const EllipsisText = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'textcolor' && prop !== 'fontfamily',
})<{ textcolor: string; fontfamily: string }>(({ textcolor, fontfamily }) => ({
  fontSize: 11,
  color: textcolor,
  paddingLeft: 2,
  paddingRight: 2,
  userSelect: 'none',
  fontFamily: fontfamily,
}));

const PageButton = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'active' && prop !== 'disabledstate' && prop !== 'palette',
})<{ active: boolean; disabledstate: boolean; palette: RcLogPaginationPalette }>(({ active, disabledstate, palette }) => ({
  minWidth: 26,
  height: 26,
  borderRadius: 5,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: disabledstate ? 'default' : 'pointer',
  background: active ? palette.activeBackground : 'transparent',
  border: `1px solid ${active ? palette.activeBorder : palette.inactiveBorder}`,
  boxShadow: active ? palette.activeShadow : 'none',
  transition: 'all 0.12s',
  '&:hover': !active && !disabledstate ? { background: palette.inactiveHoverBackground } : {},
}));

const PageButtonText = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'active' && prop !== 'palette' && prop !== 'fontfamily',
})<{ active: boolean; palette: RcLogPaginationPalette; fontfamily: string }>(({ active, palette, fontfamily }) => ({
  fontSize: 11,
  fontWeight: active ? 800 : 500,
  color: active ? palette.activeText : palette.inactiveText,
  fontFamily: fontfamily,
  userSelect: 'none',
}));

const ArrowButton = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'enabled' && prop !== 'palette',
})<{ enabled: boolean; palette: RcLogPaginationPalette }>(({ enabled, palette }) => ({
  width: 28,
  height: 28,
  borderRadius: 6,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: enabled ? 'pointer' : 'default',
  background: enabled ? palette.arrowEnabledBackground : 'transparent',
  border: `1px solid ${enabled ? palette.arrowEnabledBorder : palette.arrowDisabledBorder}`,
  opacity: enabled ? 1 : 0.4,
  transition: 'all 0.15s',
  '&:hover': enabled ? { filter: 'brightness(1.04)' } : {},
}));

function getPageItems(totalPages: number, currentPage: number): Array<number | 'ellipsis'> {
  if (totalPages <= 0) {
    return [];
  }

  const items: Array<number | 'ellipsis'> = [];
  for (let i = 0; i < totalPages; i += 1) {
    const nearCurrent = Math.abs(i - currentPage) <= 1;
    const isEdge = i === 0 || i === totalPages - 1;
    const showEllBefore = i === currentPage - 2 && currentPage > 2;
    const showEllAfter = i === currentPage + 2 && currentPage < totalPages - 3;

    if (showEllBefore || showEllAfter) {
      items.push('ellipsis');
      continue;
    }

    if (!isEdge && !nearCurrent) {
      continue;
    }

    items.push(i);
  }

  return items;
}

function RcLogPagination({
  currentPage,
  totalPages,
  disabled = false,
  onPageChange,
  palette,
  fontFamily = 'monospace',
}: RcLogPaginationProps) {
  const hasPrev = currentPage > 0;
  const hasNext = currentPage < totalPages - 1;
  const pageItems = getPageItems(totalPages, currentPage);

  return (
    <PagerGroup>
      <ArrowButton
        enabled={hasPrev && !disabled}
        palette={palette}
        onClick={() => {
          if (hasPrev && !disabled) onPageChange(currentPage - 1);
        }}
      >
        <svg width='12' height='12' viewBox='0 0 24 24' fill='none'>
          <path
            d='M15 18l-6-6 6-6'
            stroke={hasPrev && !disabled ? palette.arrowEnabledIcon : palette.arrowDisabledIcon}
            strokeWidth='2.5'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </svg>
      </ArrowButton>

      <PageList>
        {pageItems.map((item, idx) => {
          if (item === 'ellipsis') {
            return (
              <EllipsisText key={`ellipsis-${idx}`} textcolor={palette.ellipsisText} fontfamily={fontFamily}>
                ...
              </EllipsisText>
            );
          }

          const isActive = item === currentPage;
          return (
            <PageButton
              key={item}
              active={isActive}
              disabledstate={disabled}
              palette={palette}
              onClick={() => {
                if (!disabled) onPageChange(item);
              }}
            >
              <PageButtonText active={isActive} palette={palette} fontfamily={fontFamily}>
                {item + 1}
              </PageButtonText>
            </PageButton>
          );
        })}
      </PageList>

      <ArrowButton
        enabled={hasNext && !disabled}
        palette={palette}
        onClick={() => {
          if (hasNext && !disabled) onPageChange(currentPage + 1);
        }}
      >
        <svg width='12' height='12' viewBox='0 0 24 24' fill='none'>
          <path
            d='M9 18l6-6-6-6'
            stroke={hasNext && !disabled ? palette.arrowEnabledIcon : palette.arrowDisabledIcon}
            strokeWidth='2.5'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </svg>
      </ArrowButton>
    </PagerGroup>
  );
}

export default RcLogPagination;
