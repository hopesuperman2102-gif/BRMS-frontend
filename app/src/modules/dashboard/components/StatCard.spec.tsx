import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SvgIconProps } from "@mui/material";
import { ReactNode } from 'react';
import StatCard from '@/modules/dashboard/components/StatCard';

// Mock RcCard
vi.mock('@/core/components/RcCard', () => ({
  RcCard: ({ children }: { children: ReactNode }) => (
    <div data-testid="rc-card">{children}</div>
  ),
}));

// Mock icon component
const MockIcon = (props: SvgIconProps) => (
  <svg data-testid="stat-icon" {...props} />
);

describe('StatCard', () => {
  const defaultProps = {
    title: 'Active Rules',
    value: 120,
    subtitle: 'Rules currently running',
    icon: MockIcon,
    gradient: 'linear-gradient(90deg, red, blue)',
  };

  it('renders title correctly', () => {
    render(<StatCard {...defaultProps} />);
    expect(screen.getByText('Active Rules')).toBeInTheDocument();
  });

  it('renders value correctly', () => {
    render(<StatCard {...defaultProps} />);
    expect(screen.getByText('120')).toBeInTheDocument();
  });

  it('renders subtitle correctly', () => {
    render(<StatCard {...defaultProps} />);
    expect(screen.getByText('Rules currently running')).toBeInTheDocument();
  });

  it('renders icon component', () => {
    render(<StatCard {...defaultProps} />);
    expect(screen.getByTestId('stat-icon')).toBeInTheDocument();
  });

  it('renders RcCard wrapper', () => {
    render(<StatCard {...defaultProps} />);
    expect(screen.getByTestId('rc-card')).toBeInTheDocument();
  });
});