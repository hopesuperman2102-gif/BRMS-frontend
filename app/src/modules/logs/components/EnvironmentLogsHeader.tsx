import React from 'react';
import { Box, Chip, FormControl, IconButton, MenuItem, Select, Tooltip, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import { brmsTheme } from '@/core/theme/brmsTheme';
import { EnvironmentLogsHeaderProps } from '../types/environmentLogsTypes';

const DarkBar = styled(Box)({
  backgroundColor: brmsTheme.colors.textDarkSlate,
  borderBottom: '1px solid rgba(255,255,255,0.06)',
  flexShrink: 0,
});

const HeaderBar = styled(DarkBar)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px 24px',
});

const HeaderLeft = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
});

const HeaderActions = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 4,
});

const HeaderTitle = styled(Typography)({
  fontWeight: 700,
  fontSize: '0.985rem',
  color: brmsTheme.colors.surfaceBase,
  letterSpacing: '0.02em',
});

const EnvironmentChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== 'envcolor',
})<{ envcolor: string }>(({ envcolor }) => ({
  fontWeight: 800,
  fontSize: '0.65rem',
  backgroundColor: envcolor,
  color: brmsTheme.colors.white,
  height: 20,
  letterSpacing: '0.06em',
}));

const DateControl = styled(FormControl)({ minWidth: 148 });
const FileControl = styled(FormControl)({ minWidth: 320 });

const DateSelect = styled(Select)({
  height: 24,
  color: brmsTheme.colors.lightTextMid,
  fontSize: '0.72rem',
  fontFamily: 'monospace',
  '& .MuiOutlinedInput-notchedOutline': { borderColor: brmsTheme.colors.slateGray },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: brmsTheme.colors.slateGray },
  '& .MuiSelect-icon': { color: brmsTheme.colors.textGrayLight },
});

const FileSelect = styled(Select)({
  height: 30,
  color: brmsTheme.colors.lightBorder,
  fontSize: '0.72rem',
  fontFamily: 'monospace',
  '& .MuiOutlinedInput-notchedOutline': { borderColor: brmsTheme.colors.slateGray },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: brmsTheme.colors.lightTextMid },
  '& .MuiSelect-icon': { color: brmsTheme.colors.lightTextLow },
});

const DateMenuItem = styled(MenuItem)({
  color: brmsTheme.colors.lightBorderHover,
  fontSize: '0.75rem',
  fontFamily: 'monospace',
});

const FileMenuItem = styled(MenuItem)({
  color: brmsTheme.colors.lightBorderHover,
  fontSize: '0.75rem',
  fontFamily: 'monospace',
  display: 'flex',
  justifyContent: 'space-between',
  gap: 8,
});

const FileMeta = styled(Box)({ color: brmsTheme.colors.lightTextLow });

const HeaderIconButton = styled(IconButton)({
  color: brmsTheme.colors.slateText,
  '&:hover': { color: brmsTheme.colors.surfaceBase },
});

const FileBar = styled(DarkBar)({
  padding: '10px 16px',
  display: 'flex',
  alignItems: 'center',
});

const FileCaption = styled(Typography)({
  color: brmsTheme.colors.slateText,
  fontFamily: 'monospace',
});

const MetaBar = styled(DarkBar)({
  display: 'flex',
  alignItems: 'center',
  gap: 16,
  padding: '8px 24px',
});

const MetaText = styled(Typography)({
  color: brmsTheme.colors.lightTextLow,
  fontFamily: 'monospace',
});

const MetaDivider = styled(Typography)({
  color: brmsTheme.colors.slateGray,
  marginLeft: 4,
  marginRight: 4,
});

export default function EnvironmentLogsHeader({
  environment,
  envColor,
  selectedDate,
  dateOptions,
  loading,
  linesLoading,
  files,
  selectedFile,
  selectedFileIndex,
  selectedCreatedAt,
  currentPage,
  totalPages,
  onDateChange,
  onRefresh,
  onClose,
  onFileChange,
}: EnvironmentLogsHeaderProps) {
  const disabled = loading || linesLoading;

  return (
    <>
      <HeaderBar>
        <HeaderLeft>
          <HeaderTitle>Environment Logs</HeaderTitle>
          <EnvironmentChip label={environment} size='small' envcolor={envColor} />
          <DateControl size='small'>
            <DateSelect
              value={selectedDate}
              onChange={(e) => onDateChange(String(e.target.value))}
              disabled={disabled}
              MenuProps={{
                PaperProps: {
                  style: {
                    backgroundColor: brmsTheme.colors.lightTextHigh,
                    border: `1px solid ${brmsTheme.colors.slateGray}`,
                    marginTop: 4,
                  },
                },
              }}
            >
              {dateOptions.map((option) => (
                <DateMenuItem key={option.value} value={option.value}>
                  {option.label}
                </DateMenuItem>
              ))}
            </DateSelect>
          </DateControl>
        </HeaderLeft>

        <HeaderActions>
          <Tooltip title='Refresh logs'>
            <span>
              <HeaderIconButton size='small' onClick={onRefresh} disabled={disabled}>
                <RefreshIcon fontSize='small' />
              </HeaderIconButton>
            </span>
          </Tooltip>
          <HeaderIconButton size='small' onClick={onClose}>
            <CloseIcon fontSize='small' />
          </HeaderIconButton>
        </HeaderActions>
      </HeaderBar>

      <FileBar>
        {files.length === 0 ? (
          <FileCaption variant='caption'>No log files found</FileCaption>
        ) : (
          <FileControl size='small'>
            <FileSelect
              value={selectedFile ?? ''}
              renderValue={(value) => String(value)}
              onChange={(e) => onFileChange(String(e.target.value))}
              disabled={disabled}
              MenuProps={{
                PaperProps: {
                  style: {
                    backgroundColor: brmsTheme.colors.lightTextHigh,
                    border: `1px solid ${brmsTheme.colors.slateGray}`,
                    marginTop: 4,
                    maxHeight: 320,
                  },
                },
              }}
            >
              {files.map((file) => (
                <FileMenuItem key={file.file_key} value={file.file_key}>
                  <Box component='span'>{file.file_key}</Box>
                  <FileMeta as='span'>{file.line_count ?? '-'}</FileMeta>
                </FileMenuItem>
              ))}
            </FileSelect>
          </FileControl>
        )}
      </FileBar>

      <MetaBar>
        <MetaText variant='caption'>page {currentPage + 1} of {totalPages}</MetaText>
        <MetaDivider variant='caption'>|</MetaDivider>
        <MetaText variant='caption'>file {selectedFileIndex >= 0 ? selectedFileIndex + 1 : 0} of {files.length}</MetaText>
        <MetaDivider variant='caption'>|</MetaDivider>
        <MetaText variant='caption'>{selectedFile ?? '-'}</MetaText>
        <MetaDivider variant='caption'>|</MetaDivider>
        <MetaText variant='caption'>{selectedCreatedAt ? new Date(selectedCreatedAt).toLocaleString() : '-'}</MetaText>
      </MetaBar>
    </>
  );
}
