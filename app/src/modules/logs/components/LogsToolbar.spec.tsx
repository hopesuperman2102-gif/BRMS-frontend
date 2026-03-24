import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import LogsToolbar from '@/modules/logs/components/LogsToolbar';

vi.mock('framer-motion', () => ({
  motion: Object.assign(
    (Component: React.ElementType) => Component,
    {
      div: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    },
  ),
}));

vi.mock('@/core/components/RcDropdown', () => ({
  __esModule: true,
  default: ({
    items,
    value,
    onSelect,
  }: {
    items: Array<{ value: string }>;
    value?: string;
    onSelect: (value: string) => void;
  }) => (
    <div>
      <div>mock-day-value:{value ?? 'none'}</div>
      <button type='button' onClick={() => onSelect(items[0].value)}>mock-day-dropdown</button>
    </div>
  ),
}));

describe('LogsToolbar', () => {
  it('renders toolbar and handles back + day select', () => {
    const onBack = vi.fn();
    const onDaySelect = vi.fn();

    render(
      <LogsToolbar
        dayDropdownItems={[{ value: '2026-03-20', label: 'Mar 20, 2026' }]}
        selectedDay='2026-03-20'
        onDaySelect={onDaySelect}
        onBack={onBack}
      />,
    );

    expect(screen.getByText('system-logs')).toBeInTheDocument();
    expect(screen.getByText('LIVE')).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button')[0]);
    expect(onBack).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'mock-day-dropdown' }));
    expect(onDaySelect).toHaveBeenCalledWith('2026-03-20');
  });

  it('hides day dropdown when no options', () => {
    render(
      <LogsToolbar
        dayDropdownItems={[]}
        selectedDay={null}
        onDaySelect={vi.fn()}
        onBack={vi.fn()}
      />,
    );

    expect(screen.queryByRole('button', { name: 'mock-day-dropdown' })).not.toBeInTheDocument();
  });

  it('passes undefined dropdown value when selectedDay is null', () => {
    render(
      <LogsToolbar
        dayDropdownItems={[{ value: '2026-03-20', label: 'Mar 20, 2026' }]}
        selectedDay={null}
        onDaySelect={vi.fn()}
        onBack={vi.fn()}
      />,
    );

    expect(screen.getByText('mock-day-value:none')).toBeInTheDocument();
  });
});
