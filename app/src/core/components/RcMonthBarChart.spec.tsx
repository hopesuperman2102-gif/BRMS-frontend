import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import RcMonthBarChart from './RcMonthBarChart';

vi.mock('@/core/components/RcCard', () => ({
  RcCard: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const defaultProps = {
  data: [
    { year: 2024, month: 1, total: 5 },
    { year: 2024, month: 2, total: 8 },
    { year: 2023, month: 1, total: 3 },
  ],
  selectedYear: 2024,
  onYearChange: vi.fn(),
  title: 'Monthly Activity',
  subtitle: 'Entries by month',
};

function renderMonthBarChart(
  props: Partial<React.ComponentProps<typeof RcMonthBarChart>> = {}
) {
  return render(<RcMonthBarChart {...defaultProps} {...props} />);
}

describe('RcMonthBarChart', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('Rendering', () => {
    it('renders title and subtitle', () => {
      renderMonthBarChart();

      expect(screen.getByText('Monthly Activity')).toBeInTheDocument();
      expect(screen.getByText('Entries by month')).toBeInTheDocument();
    });

    it('renders available years in select menu', () => {
      renderMonthBarChart();

      fireEvent.mouseDown(screen.getByRole('combobox'));

      expect(screen.getByRole('option', { name: '2024' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '2023' })).toBeInTheDocument();
    }, 10000);

    it('renders month labels', () => {
      renderMonthBarChart();

      expect(screen.getByText('Jan')).toBeInTheDocument();
      expect(screen.getByText('Feb')).toBeInTheDocument();
      expect(screen.getByText('Dec')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('calls onYearChange when a new year is selected', () => {
      const onYearChange = vi.fn();
      renderMonthBarChart({ onYearChange });

      fireEvent.mouseDown(screen.getByRole('combobox'));
      fireEvent.click(screen.getByText('2023'));

      expect(onYearChange).toHaveBeenCalledWith(2023);
    });

    it('shows tooltip when hovering a bar', () => {
      const { container } = renderMonthBarChart();
      const divs = Array.from(container.querySelectorAll('div'));

      for (const div of divs) {
        fireEvent.mouseEnter(div);
        if (screen.queryByText('5 entries')) {
          break;
        }
      }

      expect(screen.getByText('5 entries')).toBeInTheDocument();
    });

    it('does not show tooltip when showTooltip is false', () => {
      const { container } = renderMonthBarChart({ showTooltip: false });
      const divs = Array.from(container.querySelectorAll('div'));

      for (const div of divs) {
        fireEvent.mouseEnter(div);
      }

      expect(screen.queryByText('5 entries')).not.toBeInTheDocument();
    });
  });
});
