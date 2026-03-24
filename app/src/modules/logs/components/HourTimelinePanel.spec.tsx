import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import HourTimelinePanel from '@/modules/logs/components/HourTimelinePanel';
import { HourlyLogEntry } from '@/modules/hub/types/hubEndpointsTypes';

vi.mock('framer-motion', () => ({
  motion: Object.assign(
    (Component: React.ElementType) => Component,
    {
      div: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    },
  ),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

function mkEntry(fileKey: string, total: number): HourlyLogEntry {
  return {
    file_key: fileKey,
    id: fileKey,
    created_at: '2026-03-21T10:20:00Z',
    lines: [],
    linesLoaded: false,
    info: 0,
    warnings: 0,
    errors: 0,
    total,
  };
}

describe('HourTimelinePanel', () => {
  it('renders timeline and handles hour selection', () => {
    const onHourSelect = vi.fn();
    const entries = [mkEntry('2026-03-21-08', 4), mkEntry('2026-03-21-09', 9)];

    render(
      <HourTimelinePanel
        selectedDay='2026-03-21'
        selectedFile='2026-03-21-08'
        dayEntries={entries}
        chartEntries={entries}
        onHourSelect={onHourSelect}
        formatDateLabel={() => 'Mar 21, 2026'}
      />,
    );

    expect(screen.getByText('Hour Timeline')).toBeInTheDocument();
    expect(screen.getByText('Mar 21, 2026')).toBeInTheDocument();
    expect(screen.getAllByText('08:00').length).toBeGreaterThan(0);
    expect(screen.getAllByText('09:00').length).toBeGreaterThan(0);

    const hourBadges = screen.getAllByText('09:00');
    fireEvent.click(hourBadges[hourBadges.length - 1]);
    expect(onHourSelect).toHaveBeenCalledWith('2026-03-21-09');
  });

  it('shows empty state when there are no hour entries', () => {
    const chartEntries = [mkEntry('2026-03-21-08', 4)];

    render(
      <HourTimelinePanel
        selectedDay={null}
        selectedFile={null}
        dayEntries={[]}
        chartEntries={chartEntries}
        onHourSelect={vi.fn()}
        formatDateLabel={(day) => day}
      />,
    );

    expect(screen.getByText('No hours found.')).toBeInTheDocument();
  });

  it('does not render badge time text when createdAt is empty', () => {
    const entry = mkEntry('2026-03-21-08', 3);
    entry.created_at = '';

    render(
      <HourTimelinePanel
        selectedDay='2026-03-21'
        selectedFile='2026-03-21-08'
        dayEntries={[entry]}
        chartEntries={[entry]}
        onHourSelect={vi.fn()}
        formatDateLabel={() => 'Mar 21, 2026'}
      />,
    );

    expect(screen.getAllByText('08:00').length).toBeGreaterThan(0);
    expect(screen.queryByText(/:\d{2}\s?(am|pm)/i)).not.toBeInTheDocument();
  });
});
