import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import EnvironmentLogsFooter from '@/modules/logs/components/EnvironmentLogsFooter';

vi.mock('@/core/components/RcLogLevelStats', () => ({
  __esModule: true,
  default: () => <div>mock-level-pills</div>,
}));

vi.mock('@/core/components/RcLogPagination', () => ({
  __esModule: true,
  default: ({ onPageChange, disabled }: { onPageChange: (page: number) => void; disabled: boolean }) => (
    <button type='button' disabled={disabled} onClick={() => onPageChange(2)}>mock-pagination</button>
  ),
}));

describe('EnvironmentLogsFooter', () => {
  it('shows empty row range when pageTotal is zero', () => {
    render(
      <EnvironmentLogsFooter
        pageTotal={0}
        currentPage={0}
        pageSize={10}
        totalPages={1}
        linesLoading={false}
        selectedFile={null}
        levelStats={{ info: 0, warn: 0, error: 0 }}
        onPageChange={vi.fn()}
      />,
    );

    expect(screen.getByText('rows 0-0 of 0')).toBeInTheDocument();
    expect(screen.getByText('0 total lines')).toBeInTheDocument();
    expect(screen.getByText('mock-level-pills')).toBeInTheDocument();
  });

  it('shows row range and triggers page change', () => {
    const onPageChange = vi.fn();

    render(
      <EnvironmentLogsFooter
        pageTotal={26}
        currentPage={1}
        pageSize={10}
        totalPages={3}
        linesLoading={false}
        selectedFile='file-a'
        levelStats={{ info: 1, warn: 2, error: 3 }}
        onPageChange={onPageChange}
      />,
    );

    expect(screen.getByText('rows 11-20 of 26')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'mock-pagination' }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });
});
