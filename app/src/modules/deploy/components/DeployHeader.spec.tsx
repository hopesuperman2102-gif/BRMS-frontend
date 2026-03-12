import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DeployHeader } from './DeployHeader';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  },
}));

vi.mock('@/core/components/RcCard', () => ({
  RcCard: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const dropdownSpy = vi.fn();
vi.mock('@/core/components/RcDropdown', () => ({
  __esModule: true,
  default: (props: unknown) => {
    dropdownSpy(props);
    return <div data-testid="project-dropdown" />;
  },
}));

describe('DeployHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders total rules and project dropdown', () => {
    render(
      <DeployHeader
        totalRules={1234}
        projectItems={[{ label: 'Project A', value: 'Project A' }]}
        selectedProject="Project A"
        onProjectSelect={vi.fn()}
        environments={['DEV', 'QA', 'PROD']}
      />,
    );

    expect(screen.getByText('TOTAL RULES: 1,234')).toBeInTheDocument();
    expect(screen.getByTestId('project-dropdown')).toBeInTheDocument();
    expect(dropdownSpy).toHaveBeenCalledWith(expect.objectContaining({ label: 'Project A' }));
  });

  it('calls onEnvironmentClick for rendered environment chips', () => {
    const onEnvironmentClick = vi.fn();
    render(
      <DeployHeader
        totalRules={12}
        projectItems={[]}
        selectedProject="Project A"
        onProjectSelect={vi.fn()}
        environments={['DEV', 'QA', 'PROD']}
        activeEnvironment="ALL"
        onEnvironmentClick={onEnvironmentClick}
      />,
    );

    fireEvent.click(screen.getByText('ALL'));
    fireEvent.click(screen.getByText('DEV'));
    fireEvent.click(screen.getByText('QA'));
    fireEvent.click(screen.getByText('?'));

    expect(onEnvironmentClick).toHaveBeenNthCalledWith(1, 'ALL');
    expect(onEnvironmentClick).toHaveBeenNthCalledWith(2, 'DEV');
    expect(onEnvironmentClick).toHaveBeenNthCalledWith(3, 'QA');
    expect(onEnvironmentClick).toHaveBeenNthCalledWith(4, 'PROD');
  });
});
