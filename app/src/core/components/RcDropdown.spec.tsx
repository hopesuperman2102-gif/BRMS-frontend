import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import RcDropdown from './RcDropdown';

const defaultProps = {
  label: 'Select folder',
  items: [
    { label: 'Folder A', value: 'a' },
    { label: 'Folder B', value: 'b' },
    { label: 'Add New', value: 'new', isAddNew: true },
  ],
  onSelect: vi.fn(),
};

function renderDropdown(
  props: Partial<React.ComponentProps<typeof RcDropdown>> = {}
) {
  return render(<RcDropdown {...defaultProps} {...props} />);
}

describe('RcDropdown', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('Rendering', () => {
    it('renders the default label', () => {
      renderDropdown();
      expect(screen.getByRole('button', { name: /select folder/i })).toBeInTheDocument();
    });

    it('renders custom start icon when provided', () => {
      renderDropdown({ startIcon: <span data-testid="folder-icon">F</span> });
      expect(screen.getByTestId('folder-icon')).toBeInTheDocument();
    });

    it('renders selected label when value is provided', () => {
      renderDropdown({ value: 'b' });
      expect(screen.getByRole('button', { name: /folder b/i })).toBeInTheDocument();
    });

    it('disables the trigger button when disabled is true', () => {
      renderDropdown({ disabled: true });
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('Menu interactions', () => {
    it('opens menu and shows items when clicked', () => {
      renderDropdown();
      fireEvent.click(screen.getByRole('button'));
      expect(screen.getByRole('menu')).toBeInTheDocument();
      expect(screen.getByText('Folder A')).toBeInTheDocument();
      expect(screen.getByText('Folder B')).toBeInTheDocument();
    });

    it('calls onSelect and updates selected label', () => {
      const onSelect = vi.fn();
      renderDropdown({ onSelect });
      fireEvent.click(screen.getByRole('button'));
      fireEvent.click(screen.getByText('Folder B'));
      expect(onSelect).toHaveBeenCalledWith('b');
      expect(screen.getByRole('button', { name: /folder b/i })).toBeInTheDocument();
    });

    it('shows the selected item indicator after selection', () => {
      renderDropdown();
      fireEvent.click(screen.getByRole('button'));
      fireEvent.click(screen.getByText('Folder A'));
      fireEvent.click(screen.getByRole('button', { name: /folder a/i }));
      expect(screen.getByTestId('CheckIcon')).toBeInTheDocument();
    });
  });
});
