'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { brmsTheme } from '@/core/theme/brmsTheme';
import { logsApi } from '@/modules/logs/api/logsApi';
import LogsToolbar from '@/modules/logs/components/LogsToolbar';
import HourTimelinePanel from '@/modules/logs/components/HourTimelinePanel';
import LogViewerPanel from '@/modules/logs/components/LogViewerPanel';
import { HourlyLogEntry, ParsedLogLine } from '../types/auditLogsTypes';

const { colors, fonts } = brmsTheme;

const LoadingState = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '60vh',
  gap: 16,
});

const LoadingSpinner = styled(CircularProgress)({
  color: colors.primary,
});

const LoadingText = styled(Typography)({
  color: colors.lightTextLow,
  fontFamily: fonts.mono,
  fontSize: 12,
});

const ErrorState = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '60vh',
});

const ErrorText = styled(Typography)({
  color: colors.error,
  fontFamily: fonts.mono,
});

const PageRoot = styled(Box)({
  padding: '24px 28px',
  background: colors.surfaceBase,
  minHeight: '100vh',
});

const ContentStack = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
});

function extractDate(fileKey: string): string {
  return fileKey.split('-').slice(0, -1).join('-');
}

function formatDateLabel(dateKey: string): string {
  const match = dateKey.match(/(\d{4}-\d{2}-\d{2})$/);
  if (match) {
    return new Date(match[1]).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }
  return dateKey;
}

function formatCreatedAt(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function AuditLogsPage() {
  const navigate = useNavigate();

  const [entries, setEntries] = useState<HourlyLogEntry[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const [visibleLines, setVisibleLines] = useState<ParsedLogLine[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageTotal, setPageTotal] = useState(0);
  const [linesLoading, setLinesLoading] = useState(false);

  const PAGE_SIZE = logsApi.PAGE_SIZE;

  const fetchPage = useCallback(async (fileKey: string, page: number) => {
    setLinesLoading(true);
    try {
      const { lines, total } = await logsApi.getHourlyLogPage(fileKey, page * PAGE_SIZE);
      setVisibleLines(lines);
      setCurrentPage(page);
      setPageTotal(total);
    } catch {
      // keep current state
    } finally {
      setLinesLoading(false);
    }
  }, [PAGE_SIZE]);

  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const data = await logsApi.getHourlyLogs();
        setEntries(data);
        if (data.length > 0) {
          const firstDay = extractDate(data[0].file_key);
          setSelectedDay(firstDay);
          setSelected(data[0].file_key);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load logs');
      } finally {
        setLoading(false);
      }
    }

    void init();
  }, []);

  useEffect(() => {
    if (!selected) return;
    setVisibleLines([]);
    setCurrentPage(0);
    setPageTotal(0);
    void fetchPage(selected, 0);
  }, [selected, fetchPage]);

  const uniqueDays = useMemo(() => {
    const seen = new Set<string>();
    const days: string[] = [];
    for (const entry of entries) {
      const dateKey = extractDate(entry.file_key);
      if (!seen.has(dateKey)) {
        seen.add(dateKey);
        days.push(dateKey);
      }
    }
    return days;
  }, [entries]);

  const dayDropdownItems = useMemo(
    () => uniqueDays.map((day) => ({ value: day, label: formatDateLabel(day) })),
    [uniqueDays],
  );

  const dayEntries = useMemo(
    () => (selectedDay ? entries.filter((entry) => extractDate(entry.file_key) === selectedDay) : entries),
    [entries, selectedDay],
  );

  const handleDaySelect = (day: string) => {
    setSelectedDay(day);
    const first = entries.find((entry) => extractDate(entry.file_key) === day);
    if (first) {
      setSelected(first.file_key);
    }
  };

  const activeEntry = entries.find((entry) => entry.file_key === selected);
  const totalPages = Math.ceil(pageTotal / PAGE_SIZE);
  const chartEntries = dayEntries.length > 0 ? dayEntries : entries;

  if (loading) {
    return (
      <LoadingState>
        <LoadingSpinner size={26} />
        <LoadingText>Loading log index...</LoadingText>
      </LoadingState>
    );
  }

  if (error) {
    return (
      <ErrorState>
        <ErrorText>{error}</ErrorText>
      </ErrorState>
    );
  }

  return (
    <PageRoot>
      <LogsToolbar
        dayDropdownItems={dayDropdownItems}
        selectedDay={selectedDay}
        onDaySelect={handleDaySelect}
        onBack={() => navigate(-1)}
      />

      <ContentStack>
        <HourTimelinePanel
          selectedDay={selectedDay}
          selectedFile={selected}
          dayEntries={dayEntries}
          chartEntries={chartEntries}
          onHourSelect={setSelected}
          formatDateLabel={formatDateLabel}
        />

        <LogViewerPanel
          activeEntry={activeEntry}
          visibleLines={visibleLines}
          currentPage={currentPage}
          totalPages={totalPages}
          pageTotal={pageTotal}
          pageSize={PAGE_SIZE}
          linesLoading={linesLoading}
          selectedFile={selected}
          onPageChange={(page) => {
            if (selected) {
              void fetchPage(selected, page);
            }
          }}
          formatCreatedAt={formatCreatedAt}
        />
      </ContentStack>
    </PageRoot>
  );
}
