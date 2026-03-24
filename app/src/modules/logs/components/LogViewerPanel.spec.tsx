import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import LogViewerPanel from '@/modules/logs/components/LogViewerPanel';
import { HourlyLogEntry, ParsedLogLine } from '@/modules/hub/types/hubEndpointsTypes';

vi.mock('framer-motion', () => ({
  motion: Object.assign(
    (Component: React.ElementType) => Component,
    {
      div: ({ children, ...props }: { children: React.ReactNode }) => <div {...props}>{children}</div>,
    },
  ),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/core/components/RcLogPagination', () => ({
  __esModule: true,
  default: ({ onPageChange, disabled }: { onPageChange: (page: number) => void; disabled: boolean }) => (
    <button type='button' onClick={() => onPageChange(1)} disabled={disabled}>mock-pagination</button>
  ),
}));

vi.mock('@/core/components/RcLogLevelStats', () => ({
  __esModule: true,
  default: () => <div>mock-level-stats</div>,
}));

function mkEntry(): HourlyLogEntry {
  return {
    file_key: '2026-03-21-08',
    id: '2026-03-21-08',
    created_at: '2026-03-21T10:00:00Z',
    lines: [],
    linesLoaded: false,
    info: 0,
    warnings: 0,
    errors: 0,
    total: 20,
  };
}

const baseProps = {
  currentPage: 0,
  totalPages: 2,
  pageTotal: 20,
  pageSize: 10,
  linesLoading: false,
  selectedFile: '2026-03-21-08',
  onPageChange: vi.fn(),
  formatCreatedAt: vi.fn(() => 'Mar 21, 10:00 AM'),
};

describe('LogViewerPanel', () => {
  it('renders nothing when there is no active entry', () => {
    const { container } = render(
      <LogViewerPanel
        {...baseProps}
        activeEntry={undefined}
        visibleLines={[]}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('renders loading state', () => {
    render(
      <LogViewerPanel
        {...baseProps}
        activeEntry={mkEntry()}
        visibleLines={[]}
        linesLoading
      />,
    );

    expect(screen.getByText('Fetching page 1...')).toBeInTheDocument();
  });

  it('renders empty state when page has no lines', () => {
    render(
      <LogViewerPanel
        {...baseProps}
        activeEntry={mkEntry()}
        visibleLines={[]}
      />,
    );

    expect(screen.getByText('- no events on this page -')).toBeInTheDocument();
  });

  it('renders lines and triggers pagination callback', () => {
    const onPageChange = vi.fn();
    const lines: ParsedLogLine[] = [
      { timestamp: '2026-03-21 10:00:00', level: 'WARNING', source: 'app.service.handler', message: 'warn-msg' },
    ];

    render(
      <LogViewerPanel
        {...baseProps}
        activeEntry={mkEntry()}
        visibleLines={lines}
        onPageChange={onPageChange}
      />,
    );

    expect(screen.getByText('warn-msg')).toBeInTheDocument();
    expect(screen.getByText('service.handler')).toBeInTheDocument();
    expect(screen.getByText('mock-level-stats')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'mock-pagination' }));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('renders error line branch and handles missing created_at', () => {
    const entry = mkEntry();
    entry.created_at = '';

    render(
      <LogViewerPanel
        {...baseProps}
        activeEntry={entry}
        visibleLines={[
          { timestamp: '2026-03-21 10:10:10', level: 'ERROR', source: 'core.worker', message: 'error-msg' },
        ]}
      />,
    );

    expect(screen.getByText('error-msg')).toBeInTheDocument();
    expect(screen.queryByText(/Mar 21/i)).not.toBeInTheDocument();
  });
});
