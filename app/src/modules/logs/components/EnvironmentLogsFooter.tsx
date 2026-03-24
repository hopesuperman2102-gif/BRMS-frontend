import React from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import RcLogPagination from '@/core/components/RcLogPagination';
import RcLogLevelStats from '@/core/components/RcLogLevelStats';
import { brmsTheme } from '@/core/theme/brmsTheme';
import { EnvironmentLogsFooterProps } from '../types/environmentLogsTypes';

const FooterBar = styled(Box)({
  padding: '8px 16px',
  borderTop: '1px solid rgba(255,255,255,0.06)',
  backgroundColor: brmsTheme.colors.textDarkSlate,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
  flexWrap: 'wrap',
});

const FooterText = styled(Typography)({
  fontSize: 11,
  color: brmsTheme.colors.lightTextLow,
  fontFamily: 'monospace',
  minWidth: 160,
});

const FooterRightText = styled(Typography)({
  fontSize: 10,
  color: brmsTheme.colors.slateText,
  fontFamily: 'monospace',
  textAlign: 'right',
  minWidth: 160,
});

export default function EnvironmentLogsFooter({
  pageTotal,
  currentPage,
  pageSize,
  totalPages,
  linesLoading,
  selectedFile,
  levelStats,
  onPageChange,
}: EnvironmentLogsFooterProps) {
  return (
    <FooterBar>
      <FooterText>
        {pageTotal === 0
          ? 'rows 0-0 of 0'
          : `rows ${currentPage * pageSize + 1}-${Math.min((currentPage + 1) * pageSize, pageTotal)} of ${pageTotal}`}
      </FooterText>

      <RcLogLevelStats
        compact
        items={[
          {
            key: 'info',
            label: 'INFO',
            count: levelStats.info,
            color: brmsTheme.colors.success,
            background: `rgba(${brmsTheme.colors.success}20)`,
            border: `rgba(${brmsTheme.colors.success}45)`,
          },
          {
            key: 'warn',
            label: 'WARN',
            count: levelStats.warn,
            color: brmsTheme.colors.warningAmber,
            background: `rgba(${brmsTheme.colors.warningAmber}20)`,
            border: `rgba(${brmsTheme.colors.warningAmber}45)`,
          },
          {
            key: 'error',
            label: 'ERROR',
            count: levelStats.error,
            color: brmsTheme.colors.errorRed,
            background: `rgba(${brmsTheme.colors.errorRed}20)`,
            border: `rgba(${brmsTheme.colors.errorRed}45)`,
          },
        ]}
      />

      <RcLogPagination
        currentPage={currentPage}
        totalPages={totalPages}
        disabled={linesLoading || !selectedFile}
        onPageChange={onPageChange}
        palette={{
          activeBackground: brmsTheme.colors.indigoBase,
          activeBorder: brmsTheme.colors.indigoBase,
          activeText: brmsTheme.colors.surfaceBase,
          inactiveBorder: brmsTheme.colors.slateGray,
          inactiveText: brmsTheme.colors.lightTextLow,
          inactiveHoverBackground: 'rgba(99,102,241,0.15)',
          arrowEnabledBackground: 'rgba(99,102,241,0.15)',
          arrowEnabledBorder: brmsTheme.colors.indigoBase,
          arrowDisabledBorder: brmsTheme.colors.slateGray,
          arrowEnabledIcon: brmsTheme.colors.lightBorderHover,
          arrowDisabledIcon: brmsTheme.colors.lightTextMid,
          ellipsisText: brmsTheme.colors.slateText,
        }}
      />

      <FooterRightText>{pageTotal} total lines</FooterRightText>
    </FooterBar>
  );
}
