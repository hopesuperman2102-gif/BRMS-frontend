import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { StatCardProps } from '@/modules/dashboard/types/dashboardTypes';
import Stats from '@/modules/dashboard/components/Stats';

// Mock StatCard component
vi.mock('@/modules/dashboard/components/StatCard', () => ({
  default: ({ title, value, subtitle }: Pick<StatCardProps, 'title' | 'value' | 'subtitle'>) => (
    <div data-testid="stat-card">
      <span>{title}</span>
      <span>{value}</span>
      <span>{subtitle}</span>
    </div>
  ),
}));

describe('Stats', () => {
  const props = {
    totalActiveProjects: 10,
    totalRules: 25,
    activeRules: 18,
    pendingRules: 7,
  };

  it('renders 4 stat cards', () => {
    render(<Stats {...props} />);

    const cards = screen.getAllByTestId('stat-card');

    expect(cards.length).toBe(4);
  });

  it('renders correct titles', () => {
    render(<Stats {...props} />);

    expect(screen.getByText('Total Projects')).toBeInTheDocument();
    expect(screen.getByText('Total Rules')).toBeInTheDocument();
    expect(screen.getByText('Active Rules')).toBeInTheDocument();
    expect(screen.getByText('Pending Rules')).toBeInTheDocument();
  });

  it('renders correct values', () => {
    render(<Stats {...props} />);

    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('18')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('renders correct subtitles', () => {
    render(<Stats {...props} />);

    expect(screen.getByText('In Fleet')).toBeInTheDocument();
    expect(screen.getByText('Ongoing')).toBeInTheDocument();
    expect(screen.getByText('Running Now')).toBeInTheDocument();
    expect(screen.getByText('In Queue')).toBeInTheDocument();
  });
});