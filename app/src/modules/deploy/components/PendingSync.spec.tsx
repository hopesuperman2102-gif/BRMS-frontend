import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PendingSync } from './PendingSync';

vi.mock('@/core/components/RcCard', () => ({
  RcCard: ({ children }: { children: React.ReactNode }) => <div data-testid="rc-card">{children}</div>,
}));

describe('PendingSync', () => {
  it('renders title and value', () => {
    render(<PendingSync title="Pending" value={3} />);
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders timestamp when provided', () => {
    render(<PendingSync title="Pending" value="5" timestamp="2m ago" />);
    expect(screen.getByText('2m ago')).toBeInTheDocument();
  });

  it('does not render timestamp when omitted', () => {
    render(<PendingSync title="Pending" value="5" />);
    expect(screen.queryByText('2m ago')).not.toBeInTheDocument();
  });
});
