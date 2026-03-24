import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import EnvironmentLogsHeader from '@/modules/logs/components/EnvironmentLogsHeader';

const baseProps = {
  environment: 'DEV',
  envColor: '#123456',
  selectedDate: '2026-03-21',
  dateOptions: [{ value: '2026-03-21', label: 'Mar 21, 2026' }],
  loading: false,
  linesLoading: false,
  files: [] as Array<{ file_key: string; line_count?: number; created_at?: string }>,
  selectedFile: null,
  selectedFileIndex: -1,
  selectedCreatedAt: undefined,
  currentPage: 0,
  totalPages: 1,
  onDateChange: vi.fn(),
  onRefresh: vi.fn(),
  onClose: vi.fn(),
  onFileChange: vi.fn(),
};

describe('EnvironmentLogsHeader', () => {
  it('renders header and handles refresh/close', () => {
    const onRefresh = vi.fn();
    const onClose = vi.fn();

    render(<EnvironmentLogsHeader {...baseProps} onRefresh={onRefresh} onClose={onClose} />);

    expect(screen.getByText('Environment Logs')).toBeInTheDocument();
    expect(screen.getByText('No log files found')).toBeInTheDocument();

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    fireEvent.click(buttons[1]);

    expect(onRefresh).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  }, 15000);

  it('handles date and file changes', () => {
    const onDateChange = vi.fn();
    const onFileChange = vi.fn();

    const { container } = render(
      <EnvironmentLogsHeader
        {...baseProps}
        onDateChange={onDateChange}
        onFileChange={onFileChange}
        files={[
          { file_key: 'f1', line_count: 10, created_at: '2026-03-21T10:00:00Z' },
          { file_key: 'f2', line_count: 20, created_at: '2026-03-21T11:00:00Z' },
        ]}
        selectedFile='f1'
        selectedFileIndex={0}
        selectedCreatedAt='2026-03-21T10:00:00Z'
      />,
    );

    const inputs = container.querySelectorAll('input');
    fireEvent.change(inputs[0], { target: { value: '2026-03-21' } });
    fireEvent.change(inputs[1], { target: { value: 'f2' } });

    expect(onFileChange).toHaveBeenCalledWith('f2');
    expect(screen.getByText('file 1 of 2')).toBeInTheDocument();
  });
});
