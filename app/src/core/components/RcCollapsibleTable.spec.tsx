import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RcCollapsibleTable } from './RcCollapsibleTable';

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'status', label: 'Status' },
];

const sections = [
  {
    key: 'sec-1',
    title: 'Section One',
    showHeader: true,
    rows: [
      { id: '1', name: 'Row One', status: 'Active' },
      { id: '2', name: 'Row Two', status: 'Inactive' },
    ],
  },
  {
    key: 'sec-2',
    title: 'Section Two',
    showHeader: false,
    rows: [{ id: '3', name: 'Row Three', status: 'Pending' }],
  },
];

function renderCollapsibleTable() {
  return render(
    <RcCollapsibleTable
      columns={columns}
      sections={sections}
      getRowId={(row) => row.id}
    />
  );
}

describe('RcCollapsibleTable', () => {
  describe('Rendering', () => {
    it('renders section titles', () => {
      renderCollapsibleTable();

      expect(screen.getByText('Section One')).toBeInTheDocument();
      expect(screen.getByText('Section Two')).toBeInTheDocument();
    });

    it('renders row count chip for section header', () => {
      renderCollapsibleTable();

      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('expands and collapses section rows when section is clicked', () => {
      renderCollapsibleTable();

      expect(screen.queryByText('Row One')).not.toBeInTheDocument();
      fireEvent.click(screen.getByText('Section One'));
      expect(screen.getByText('Row One')).toBeInTheDocument();
      expect(screen.getByText('Row Two')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Section One'));
      expect(screen.queryByText('Row One')).not.toBeInTheDocument();
    });

    it('renders rows for secondary section after expansion', () => {
      renderCollapsibleTable();

      fireEvent.click(screen.getByText('Section Two'));

      expect(screen.getByText('Row Three')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });
  });
});
