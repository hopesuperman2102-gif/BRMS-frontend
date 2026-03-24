import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import EnvironmentLogsBody from '@/modules/logs/components/EnvironmentLogsBody';

const getLevelConfig = vi.fn((level: string) => ({
  color: level === 'ERROR' ? '#f00' : '#0f0',
  bg: '#111',
  label: level,
}));

describe('EnvironmentLogsBody', () => {
  it('shows loading spinner', () => {
    render(
      <EnvironmentLogsBody
        loading
        linesLoading={false}
        error={null}
        lines={[]}
        environment='DEV'
        getLevelConfig={getLevelConfig}
      />,
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows error state', () => {
    render(
      <EnvironmentLogsBody
        loading={false}
        linesLoading={false}
        error='failed-load'
        lines={[]}
        environment='DEV'
        getLevelConfig={getLevelConfig}
      />,
    );

    expect(screen.getByText('failed-load')).toBeInTheDocument();
  });

  it('shows lines loading spinner', () => {
    render(
      <EnvironmentLogsBody
        loading={false}
        linesLoading
        error={null}
        lines={[]}
        environment='DEV'
        getLevelConfig={getLevelConfig}
      />,
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows empty state', () => {
    render(
      <EnvironmentLogsBody
        loading={false}
        linesLoading={false}
        error={null}
        lines={[]}
        environment='QA'
        getLevelConfig={getLevelConfig}
      />,
    );

    expect(screen.getByText('No logs found for QA')).toBeInTheDocument();
  });

  it('renders parsed rows and level styling data', () => {
    render(
      <EnvironmentLogsBody
        loading={false}
        linesLoading={false}
        error={null}
        lines={[
          {
            timestamp: '2026-03-21 10:11:12',
            level: 'ERROR',
            source: 'app.logs.worker',
            message: 'boom',
          },
        ]}
        environment='DEV'
        getLevelConfig={getLevelConfig}
      />,
    );

    expect(screen.getByText('2026-03-21 10:11:12')).toBeInTheDocument();
    expect(screen.getByText('ERROR')).toBeInTheDocument();
    expect(screen.getByText('worker')).toBeInTheDocument();
    expect(screen.getByText('boom')).toBeInTheDocument();
    expect(getLevelConfig).toHaveBeenCalledWith('ERROR');
  });
});
