'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Drawer } from '@mui/material';
import { styled } from '@mui/material/styles';
import { deployApi } from '@/modules/deploy/api/deployApi';
import { brmsTheme } from '@/core/theme/brmsTheme';
import EnvironmentLogsHeader from '@/modules/logs/components/EnvironmentLogsHeader';
import EnvironmentLogsBody from '@/modules/logs/components/EnvironmentLogsBody';
import EnvironmentLogsFooter from '@/modules/logs/components/EnvironmentLogsFooter';
import { countLogLevels } from '../utils/envLogsUtils';
import { EnvironmentLogsProps, ParsedEnvLogLine } from '../types/environmentLogsTypes';
import { RawEnvLogFileMeta } from '@/modules/deploy/types/deployEndpointsTypes';


const PAGE_SIZE = 10;
const DATE_LOOKBACK_DAYS = 14;

const StyledDrawer = styled(Drawer)({
  '& .MuiDrawer-paper': {
    width: 680,
    maxWidth: '100vw',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: brmsTheme.colors.lightTextHigh,
  },
  '@media (max-width: 600px)': {
    '& .MuiDrawer-paper': {
      width: '100vw',
    },
  },
});

function formatLocalDateYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateLabel(date: string): string {
  const parsed = new Date(`${date}T00:00:00`);
  return parsed.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

const parseLogLine = (line: string): ParsedEnvLogLine | null => {
  const parts = line.split(/\s*\|\s*/);
  if (parts.length >= 4) {
    return {
      timestamp: parts[0].trim(),
      level: parts[1].trim(),
      source: parts[2].trim(),
      message: parts.slice(3).join(' | ').trim(),
    };
  }
  return null;
};

const LEVEL_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  INFO: { color: brmsTheme.colors.success, bg: `rgba(${brmsTheme.colors.success}20)`, label: 'INFO' },
  ERROR: { color: brmsTheme.colors.errorRed, bg: `rgba(${brmsTheme.colors.errorRed}20)`, label: 'ERROR' },
  WARN: { color: brmsTheme.colors.warningAmber, bg: `rgba(${brmsTheme.colors.warningAmber}20)`, label: 'WARN' },
  WARNING: { color: brmsTheme.colors.warningAmber, bg: `rgba(${brmsTheme.colors.warningAmber}20)`, label: 'WARN' },
  DEBUG: { color: brmsTheme.colors.chartBlueLight, bg: `rgba(${brmsTheme.colors.chartBlueLight}20)`, label: 'DEBUG' },
};

const getLevelConfig = (level: string) =>
  LEVEL_CONFIG[level.toUpperCase()] ?? {
    color: brmsTheme.colors.lightTextLow,
    bg: `rgba(${brmsTheme.colors.lightTextLow}20)`,
    label: level,
  };

const ENV_COLORS: Record<string, string> = {
  PROD: brmsTheme.colors.errorRed,
  QA: brmsTheme.colors.warningAmber,
  DEV: brmsTheme.colors.indigoBase,
};

export const EnvironmentLogs: React.FC<EnvironmentLogsProps> = ({
  open,
  environment,
  onClose,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(formatLocalDateYYYYMMDD(new Date()));
  const [files, setFiles] = useState<RawEnvLogFileMeta[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [lines, setLines] = useState<ParsedEnvLogLine[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageTotal, setPageTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [linesLoading, setLinesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dateOptions = useMemo(() => {
    const base = new Date();
    return Array.from({ length: DATE_LOOKBACK_DAYS }, (_, idx) => {
      const d = new Date(base);
      d.setDate(base.getDate() - idx);
      const value = formatLocalDateYYYYMMDD(d);
      return { value, label: formatDateLabel(value) };
    });
  }, []);

  const fetchPage = useCallback(async (fileKey: string, page: number) => {
    setLinesLoading(true);
    try {
      const res = await deployApi.getEnvironmentLogPage(environment, fileKey, page * PAGE_SIZE);
      const parsed = res.data
        .filter((line) => line.trim())
        .map(parseLogLine)
        .filter(Boolean) as ParsedEnvLogLine[];
      setLines(parsed);
      setCurrentPage(page);
      setPageTotal(res.total);
    } catch {
      setError('Failed to load log page. Please try again.');
      setLines([]);
      setPageTotal(0);
    } finally {
      setLinesLoading(false);
    }
  }, [environment]);

  const fetchLogs = useCallback(async () => {
    if (!environment) return;
    setLoading(true);
    setError(null);
    try {
      const fileList = await deployApi.getEnvironmentLogFiles(environment, selectedDate);
      setFiles(fileList);
      if (!fileList.length) {
        setSelectedFile(null);
        setLines([]);
        setPageTotal(0);
        setCurrentPage(0);
        return;
      }
      const first = fileList[0].file_key;
      setSelectedFile(first);
      await fetchPage(first, 0);
    } catch {
      setError('Failed to load logs. Please try again.');
      setFiles([]);
      setSelectedFile(null);
      setLines([]);
      setPageTotal(0);
      setCurrentPage(0);
    } finally {
      setLoading(false);
    }
  }, [environment, fetchPage, selectedDate]);

  useEffect(() => {
    if (open) {
      void fetchLogs();
    } else {
      setSelectedDate(formatLocalDateYYYYMMDD(new Date()));
      setFiles([]);
      setSelectedFile(null);
      setLines([]);
      setError(null);
      setCurrentPage(0);
      setPageTotal(0);
      setLoading(false);
      setLinesLoading(false);
    }
  }, [open, fetchLogs]);

  const envColor = ENV_COLORS[environment] ?? brmsTheme.colors.indigoBase;
  const totalPages = Math.max(1, Math.ceil(pageTotal / PAGE_SIZE));
  const selectedMeta = useMemo(
    () => files.find((file) => file.file_key === selectedFile),
    [files, selectedFile],
  );
  const selectedFileIndex = useMemo(
    () => files.findIndex((file) => file.file_key === selectedFile),
    [files, selectedFile],
  );
  const levelStats = useMemo(() => countLogLevels(lines, (line) => line.level), [lines]);

  return (
    <StyledDrawer anchor='right' open={open} onClose={onClose}>
      <EnvironmentLogsHeader
        environment={environment}
        envColor={envColor}
        selectedDate={selectedDate}
        dateOptions={dateOptions}
        loading={loading}
        linesLoading={linesLoading}
        files={files}
        selectedFile={selectedFile}
        selectedFileIndex={selectedFileIndex}
        selectedCreatedAt={selectedMeta?.created_at}
        currentPage={currentPage}
        totalPages={totalPages}
        onDateChange={setSelectedDate}
        onRefresh={() => void fetchLogs()}
        onClose={onClose}
        onFileChange={(nextFile) => {
          if (!nextFile || nextFile === selectedFile || linesLoading) return;
          setSelectedFile(nextFile);
          void fetchPage(nextFile, 0);
        }}
      />

      <EnvironmentLogsBody
        loading={loading}
        linesLoading={linesLoading}
        error={error}
        lines={lines}
        environment={environment}
        getLevelConfig={getLevelConfig}
      />

      <EnvironmentLogsFooter
        pageTotal={pageTotal}
        currentPage={currentPage}
        pageSize={PAGE_SIZE}
        totalPages={totalPages}
        linesLoading={linesLoading}
        selectedFile={selectedFile}
        levelStats={levelStats}
        onPageChange={(page) => {
          if (selectedFile) {
            void fetchPage(selectedFile, page);
          }
        }}
      />
    </StyledDrawer>
  );
};
