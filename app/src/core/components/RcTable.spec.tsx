import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import RcTable from './RcTable';

const defaultProps = {
  headers: ['Name', 'Status'],
  rows: [
    { Name: 'Rule One', Status: 'Active' },
    { Name: 'Rule Two', Status: 'Inactive' },
  ],
  onRowClick: vi.fn(),
  selectedRowIndex: 0,
};

function renderTable(
  props: Partial<React.ComponentProps<typeof RcTable>> = {}
) {
  return render(<RcTable {...defaultProps} {...props} />);
}

describe('RcTable', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('Rendering', () => {
    it('renders headers', () => {
      renderTable();

      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
    });

    it('renders row data', () => {
      renderTable();

      expect(screen.getByText('Rule One')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('Rule Two')).toBeInTheDocument();
    });

    it('renders fallback text for missing values', () => {
      renderTable({
        rows: [{ Name: 'Rule One' }],
      });

      expect(screen.getByText('-')).toBeInTheDocument();
    });

    it('renders empty state when no rows are provided', () => {
      renderTable({
        rows: [],
      });

      expect(screen.getByText('No Data Available')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('calls onRowClick with row and index', () => {
      const onRowClick = vi.fn();
      renderTable({ onRowClick });

      fireEvent.click(screen.getByText('Rule Two'));

      expect(onRowClick).toHaveBeenCalledWith(
        { Name: 'Rule Two', Status: 'Inactive' },
        1
      );
    });
  });
});
