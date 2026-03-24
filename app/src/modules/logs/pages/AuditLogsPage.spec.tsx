import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AuditLogsPage from '@/modules/logs/pages/AuditLogsPage';

const navigateSpy = vi.fn();
const getHourlyLogs = vi.fn();
const getHourlyLogPage = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => navigateSpy,
}));

vi.mock('@/modules/hub/api/logsApi', () => ({
  logsApi: {
    getHourlyLogs: (...args: unknown[]) => getHourlyLogs(...args),
    getHourlyLogPage: (...args: unknown[]) => getHourlyLogPage(...args),
    PAGE_SIZE: 10,
  },
}));

vi.mock('@/modules/logs/components/LogsToolbar', () => ({
  __esModule: true,
  default: ({ dayDropdownItems, onDaySelect, onBack }: {
    dayDropdownItems: Array<{ value: string }>;
    onDaySelect: (value: string) => void;
    onBack: () => void;
  }) => (
    <div>
      <div>toolbar-days:{dayDropdownItems.length}</div>
      <button type='button' onClick={onBack}>mock-back</button>
      <button
        type='button'
        onClick={() => dayDropdownItems[1] && onDaySelect(dayDropdownItems[1].value)}
      >
        mock-day-select
      </button>
    </div>
  ),
}));

vi.mock('@/modules/logs/components/HourTimelinePanel', () => ({
  __esModule: true,
  default: ({ dayEntries, chartEntries, onHourSelect }: {
    dayEntries: Array<{ file_key: string }>;
    chartEntries: Array<{ file_key: string }>;
    onHourSelect: (fileKey: string) => void;
  }) => (
    <div>
      <div>day-count:{dayEntries.length}</div>
      <div>chart-count:{chartEntries.length}</div>
      <button type='button' onClick={() => dayEntries[0] && onHourSelect(dayEntries[0].file_key)}>mock-hour-select</button>
    </div>
  ),
}));

vi.mock('@/modules/logs/components/LogViewerPanel', () => ({
  __esModule: true,
  default: ({ activeEntry, pageTotal, onPageChange }: {
    activeEntry?: { file_key: string };
    pageTotal: number;
    onPageChange: (page: number) => void;
  }) => (
    <div>
      <div>viewer-entry:{activeEntry?.file_key ?? 'none'}</div>
      <div>viewer-page-total:{pageTotal}</div>
      <button type='button' onClick={() => onPageChange(1)}>mock-next-page</button>
    </div>
  ),
}));

const hourlyEntries = [
  {
    file_key: '2026-03-21-08',
    id: '2026-03-21-08',
    created_at: '2026-03-21T10:00:00Z',
    lines: [],
    linesLoaded: false,
    info: 0,
    warnings: 0,
    errors: 0,
    total: 10,
  },
  {
    file_key: '2026-03-20-07',
    id: '2026-03-20-07',
    created_at: '2026-03-20T09:00:00Z',
    lines: [],
    linesLoaded: false,
    info: 0,
    warnings: 0,
    errors: 0,
    total: 8,
  },
];

describe('AuditLogsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state while logs are being fetched', () => {
    getHourlyLogs.mockReturnValue(new Promise(() => {}));

    render(<AuditLogsPage />);

    expect(screen.getByText('Loading log index...')).toBeInTheDocument();
  });

  it('renders error state when hourly logs request fails', async () => {
    getHourlyLogs.mockRejectedValueOnce(new Error('failed hourly request'));

    render(<AuditLogsPage />);

    expect(await screen.findByText('failed hourly request')).toBeInTheDocument();
  });

  it('loads entries, fetches page, handles back/day/page events', async () => {
    getHourlyLogs.mockResolvedValueOnce(hourlyEntries);
    getHourlyLogPage.mockResolvedValue({ lines: [], total: 42 });

    render(<AuditLogsPage />);

    expect(await screen.findByText('toolbar-days:2')).toBeInTheDocument();
    expect(await screen.findByText('viewer-entry:2026-03-21-08')).toBeInTheDocument();

    await waitFor(() => {
      expect(getHourlyLogPage).toHaveBeenCalledWith('2026-03-21-08', 0);
    });

    fireEvent.click(screen.getByRole('button', { name: 'mock-next-page' }));
    await waitFor(() => {
      expect(getHourlyLogPage).toHaveBeenCalledWith('2026-03-21-08', 10);
    });

    fireEvent.click(screen.getByRole('button', { name: 'mock-day-select' }));
    await waitFor(() => {
      expect(getHourlyLogPage).toHaveBeenCalledWith('2026-03-20-07', 0);
    });

    fireEvent.click(screen.getByRole('button', { name: 'mock-back' }));
    expect(navigateSpy).toHaveBeenCalledWith(-1);
  });

  it('keeps screen stable when page fetch fails', async () => {
    getHourlyLogs.mockResolvedValueOnce(hourlyEntries);
    getHourlyLogPage.mockRejectedValueOnce(new Error('page failed'));

    render(<AuditLogsPage />);

    expect(await screen.findByText('toolbar-days:2')).toBeInTheDocument();
    expect(await screen.findByText('viewer-entry:2026-03-21-08')).toBeInTheDocument();
  });
});
