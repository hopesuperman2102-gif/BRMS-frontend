import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EnvironmentDeployment } from './Environmentdeployment';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  },
}));

vi.mock('@/core/components/RcCard', () => ({
  RcCard: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardHeader: ({ title }: { title: string }) => <div>{title}</div>,
}));

describe('EnvironmentDeployment', () => {
  it('renders title and environments', () => {
    render(
      <EnvironmentDeployment
        environments={['DEV', 'QA', 'PROD']}
        selectedEnvironment="QA"
        onEnvironmentChange={vi.fn()}
        onDeploy={vi.fn()}
      />,
    );

    expect(screen.getByText('Environment & Deployment Action')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'DEV' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'QA' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'PROD' })).toBeInTheDocument();
  }, 15000);

  it('changes environment and deploys', () => {
    const onEnvironmentChange = vi.fn();
    const onDeploy = vi.fn();

    render(
      <EnvironmentDeployment
        environments={['DEV', 'QA', 'PROD']}
        selectedEnvironment="QA"
        onEnvironmentChange={onEnvironmentChange}
        onDeploy={onDeploy}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'DEV' }));
    fireEvent.click(screen.getByRole('button', { name: 'Deploy to QA' }));

    expect(onEnvironmentChange).toHaveBeenCalledWith('DEV');
    expect(onDeploy).toHaveBeenCalled();
  });

  it('disables deploy button when canDeploy is false', () => {
    render(
      <EnvironmentDeployment
        environments={['DEV', 'QA', 'PROD']}
        selectedEnvironment="QA"
        onEnvironmentChange={vi.fn()}
        onDeploy={vi.fn()}
        canDeploy={false}
      />,
    );

    expect(screen.getByRole('button', { name: 'Deploy to QA' })).toBeDisabled();
  });
});
