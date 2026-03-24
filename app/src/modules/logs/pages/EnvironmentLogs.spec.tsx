import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EnvironmentLogs } from '../../logs/pages/EnvironmentLogs';

const { getEnvironmentLogFiles, getEnvironmentLogPage } = vi.hoisted(() => ({
  getEnvironmentLogFiles: vi.fn(),
  getEnvironmentLogPage: vi.fn(),
}));

vi.mock('@/modules/deploy/api/deployApi', () => ({
  deployApi: {
    getEnvironmentLogFiles,
    getEnvironmentLogPage,
  },
}));

describe('EnvironmentLogs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not show content when closed', () => {
    render(<EnvironmentLogs open={false} environment="DEV" onClose={vi.fn()} />);
    expect(screen.queryByText('Environment Logs')).not.toBeInTheDocument();
  });

  it('loads files and first page when opened', async () => {
    getEnvironmentLogFiles.mockResolvedValueOnce([
      { file_key: '2026-03-11-DEV', line_count: 12, created_at: '2026-03-11T10:00:00Z' },
    ]);
    getEnvironmentLogPage.mockResolvedValueOnce({
      file_key: '2026-03-11-DEV',
      environment: 'DEV',
      data: ['12:00 | INFO | env.logs | first message'],
      total: 12,
      count: 1,
      skip: 0,
      limit: 10,
    });

    render(<EnvironmentLogs open environment="DEV" onClose={vi.fn()} />);

    expect(await screen.findByText('first message')).toBeInTheDocument();
    expect(screen.getByText('Environment Logs')).toBeInTheDocument();
    expect(getEnvironmentLogFiles).toHaveBeenCalled();
    expect(getEnvironmentLogPage).toHaveBeenCalledWith('DEV', '2026-03-11-DEV', 0);
  }, 10000);

  it('shows empty file state', async () => {
    getEnvironmentLogFiles.mockResolvedValueOnce([]);

    render(<EnvironmentLogs open environment="DEV" onClose={vi.fn()} />);

    expect(await screen.findByText('No log files found')).toBeInTheDocument();
  });

  it('shows fetch error state', async () => {
    getEnvironmentLogFiles.mockRejectedValueOnce(new Error('fail'));

    render(<EnvironmentLogs open environment="DEV" onClose={vi.fn()} />);

    expect(await screen.findByText('Failed to load logs. Please try again.')).toBeInTheDocument();
  });

  it('refreshes logs and paginates', async () => {
    getEnvironmentLogFiles.mockResolvedValue([
      { file_key: '2026-03-11-DEV', line_count: 12, created_at: '2026-03-11T10:00:00Z' },
    ]);
    getEnvironmentLogPage
      .mockResolvedValueOnce({
        file_key: '2026-03-11-DEV',
        environment: 'DEV',
        data: ['12:00 | INFO | env.logs | page one'],
        total: 12,
        count: 1,
        skip: 0,
        limit: 10,
      })
      .mockResolvedValueOnce({
        file_key: '2026-03-11-DEV',
        environment: 'DEV',
        data: ['12:10 | ERROR | env.logs | page two'],
        total: 12,
        count: 1,
        skip: 10,
        limit: 10,
      })
      .mockResolvedValueOnce({
        file_key: '2026-03-11-DEV',
        environment: 'DEV',
        data: ['12:00 | INFO | env.logs | refreshed'],
        total: 12,
        count: 1,
        skip: 0,
        limit: 10,
      });

    render(<EnvironmentLogs open environment="DEV" onClose={vi.fn()} />);

    expect(await screen.findByText('page one')).toBeInTheDocument();

    fireEvent.click(screen.getByText('2'));
    expect(await screen.findByText('page two')).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button')[0]);
    await waitFor(() => expect(getEnvironmentLogFiles).toHaveBeenCalledTimes(2));
  }, 10000);

  it('shows page-load error when log page fetch fails', async () => {
    getEnvironmentLogFiles.mockResolvedValueOnce([
      { file_key: '2026-03-11-DEV', line_count: 12, created_at: '2026-03-11T10:00:00Z' },
    ]);
    getEnvironmentLogPage.mockRejectedValueOnce(new Error('page fail'));

    render(<EnvironmentLogs open environment="DEV" onClose={vi.fn()} />);

    expect(await screen.findByText('Failed to load log page. Please try again.')).toBeInTheDocument();
  });

  it('ignores malformed log lines and shows empty page state', async () => {
    getEnvironmentLogFiles.mockResolvedValueOnce([
      { file_key: '2026-03-11-DEV', line_count: 1, created_at: '2026-03-11T10:00:00Z' },
    ]);
    getEnvironmentLogPage.mockResolvedValueOnce({
      file_key: '2026-03-11-DEV',
      environment: 'DEV',
      data: ['not-a-parseable-line'],
      total: 1,
      count: 1,
      skip: 0,
      limit: 10,
    });

    render(<EnvironmentLogs open environment='DEV' onClose={vi.fn()} />);

    expect(await screen.findByText('No logs found for DEV')).toBeInTheDocument();
  });
});
