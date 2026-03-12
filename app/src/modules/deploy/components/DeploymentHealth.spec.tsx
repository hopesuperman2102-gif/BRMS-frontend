import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DeploymentHealth } from './DeploymentHealth';

vi.mock('@/core/components/RcCard', () => ({
  RcCard: ({ children }: { children: React.ReactNode }) => <div data-testid="rc-card">{children}</div>,
}));

describe('DeploymentHealth', () => {
  it('renders title, total and legend values', () => {
    const { container } = render(
      <DeploymentHealth
        title="Deployment Health"
        health={{ total: 10, pending: 2, approved: 5, rejected: 3 }}
      />,
    );

    expect(screen.getByText('Deployment Health')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Approved')).toBeInTheDocument();
    expect(screen.getByText('Rejected')).toBeInTheDocument();
    expect(container.querySelectorAll('circle')).toHaveLength(3);
  });

  it('renders zero total without crashing', () => {
    const { container } = render(
      <DeploymentHealth
        title="Deployment Health"
        health={{ total: 0, pending: 0, approved: 0, rejected: 0 }}
      />,
    );

    expect(container.querySelector('text')?.textContent).toBe('0');
  });
});
