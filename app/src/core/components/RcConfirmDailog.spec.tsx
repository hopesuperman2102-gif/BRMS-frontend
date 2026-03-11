import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import RcConfirmDialog from './RcConfirmDailog';

const defaultProps = {
  open: true,
  message: 'Are you sure?',
  onConfirm: vi.fn(),
  onCancel: vi.fn(),
};

function renderConfirmDialog(
  props: Partial<React.ComponentProps<typeof RcConfirmDialog>> = {}
) {
  return render(<RcConfirmDialog {...defaultProps} {...props} />);
}

describe('RcConfirmDialog', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('Rendering', () => {
    it('renders title and message', () => {
      renderConfirmDialog();
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Confirm' })).toBeInTheDocument();
      expect(screen.getByText('Are you sure?')).toBeInTheDocument();
    });

    it('renders custom button labels', () => {
      renderConfirmDialog({ confirmText: 'Delete', cancelText: 'Keep' });
      expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Keep' })).toBeInTheDocument();
    });

    it('does not render content when closed', () => {
      renderConfirmDialog({ open: false });
      expect(screen.queryByText('Are you sure?')).not.toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('calls onConfirm when confirm button is clicked', () => {
      const onConfirm = vi.fn();
      renderConfirmDialog({ onConfirm });
      fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel when cancel button is clicked', () => {
      const onCancel = vi.fn();
      renderConfirmDialog({ onCancel });
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });
});
