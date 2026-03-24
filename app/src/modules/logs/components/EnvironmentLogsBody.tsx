import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { brmsTheme } from '@/core/theme/brmsTheme';
import { EnvironmentLogsBodyProps } from '../types/environmentLogsTypes';

const LogBody = styled(Box)({
  flex: 1,
  overflow: 'auto',
  paddingTop: 16,
  paddingBottom: 16,
  '&::-webkit-scrollbar': { width: 4 },
  '&::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
  '&::-webkit-scrollbar-thumb': { backgroundColor: brmsTheme.colors.slateGray, borderRadius: 2 },
});

const CenterState = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
});

const CenterError = styled(Typography)({
  color: brmsTheme.colors.errorRed,
  fontFamily: 'monospace',
});

const CenterEmpty = styled(Typography)({
  color: brmsTheme.colors.lightTextMid,
  fontFamily: 'monospace',
});

const LoadingSpinner = styled(CircularProgress)({
  color: brmsTheme.colors.indigoBase,
});

const BodyPadding = styled(Box)({
  paddingLeft: 16,
  paddingRight: 16,
});

const LogRow = styled(Box)({
  display: 'grid',
  gridTemplateColumns: '152px 52px 1fr',
  gap: 12,
  alignItems: 'baseline',
  padding: '5px 12px',
  borderRadius: 4,
  '&:hover': { backgroundColor: 'rgba(255,255,255,0.03)' },
});

const TimestampText = styled(Typography)({
  fontSize: '0.68rem',
  fontFamily: 'monospace',
  color: brmsTheme.colors.lightTextMid,
  whiteSpace: 'nowrap',
});

const LevelBadge = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'badgebg' && prop !== 'badgeborder',
})<{ badgebg: string; badgeborder: string }>(({ badgebg, badgeborder }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '1px 6px',
  borderRadius: 4,
  backgroundColor: badgebg,
  border: `1px solid ${badgeborder}`,
}));

const LevelText = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'textcolor',
})<{ textcolor: string }>(({ textcolor }) => ({
  fontSize: '0.6rem',
  fontFamily: 'monospace',
  fontWeight: 700,
  color: textcolor,
  letterSpacing: '0.05em',
}));

const MessageRow = styled(Box)({
  display: 'flex',
  gap: 8,
  alignItems: 'baseline',
  minWidth: 0,
});

const SourceText = styled(Typography)({
  fontSize: '0.68rem',
  fontFamily: 'monospace',
  color: brmsTheme.colors.indigoBase,
  whiteSpace: 'nowrap',
  flexShrink: 0,
});

const ArrowText = styled(Typography)({
  fontSize: '0.68rem',
  fontFamily: 'monospace',
  color: brmsTheme.colors.slateGray,
  flexShrink: 0,
});

const MessageText = styled(Typography)({
  fontSize: '0.72rem',
  fontFamily: 'monospace',
  color: brmsTheme.colors.lightTextLow,
  wordBreak: 'break-word',
});

export default function EnvironmentLogsBody({
  loading,
  linesLoading,
  error,
  lines,
  environment,
  getLevelConfig,
}: EnvironmentLogsBodyProps) {
  return (
    <LogBody>
      {loading ? (
        <CenterState>
          <LoadingSpinner size={24} />
        </CenterState>
      ) : error ? (
        <CenterState>
          <CenterError variant='body2'>{error}</CenterError>
        </CenterState>
      ) : linesLoading ? (
        <CenterState>
          <LoadingSpinner size={20} />
        </CenterState>
      ) : lines.length === 0 ? (
        <CenterState>
          <CenterEmpty variant='body2'>No logs found for {environment}</CenterEmpty>
        </CenterState>
      ) : (
        <BodyPadding>
          {lines.map((line, idx) => {
            const cfg = getLevelConfig(line.level);
            return (
              <LogRow key={`${line.timestamp}-${idx}`}>
                <TimestampText>{line.timestamp}</TimestampText>

                <LevelBadge badgebg={cfg.bg} badgeborder={`${cfg.color}22`}>
                  <LevelText textcolor={cfg.color}>{cfg.label}</LevelText>
                </LevelBadge>

                <MessageRow>
                  <SourceText title={line.source}>{line.source.split('.').pop()}</SourceText>
                  <ArrowText>&gt;</ArrowText>
                  <MessageText>{line.message}</MessageText>
                </MessageRow>
              </LogRow>
            );
          })}
        </BodyPadding>
      )}
    </LogBody>
  );
}
