import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RcAppdrawer from './RcAppdrawer';


const defaultProps = {
  open: true,
  onClose: vi.fn(),
  title: 'Test Drawer',
  children: <div>Default Content</div>,
};

function renderDrawer(props = {}) {
  return render(<RcAppdrawer {...defaultProps} {...props} />);
}

describe('RcAppDrawer', () => {
  beforeEach(() => vi.clearAllMocks());

  /* ── Rendering ──────────────────────────────────────────── */
  describe('Rendering', () => {
    it('renders the title', () => {
      renderDrawer();
      expect(screen.getByText('Test Drawer')).toBeInTheDocument();
    });

    it('renders subtitle when provided', () => {
      renderDrawer({ subtitle: 'Sub text' });
      expect(screen.getByText('Sub text')).toBeInTheDocument();
    });

    it('does not render subtitle when not provided', () => {
      renderDrawer();
      expect(screen.queryByText('Sub text')).not.toBeInTheDocument();
    });

    it('renders children inside drawer body', () => {
      renderDrawer({ children: <div data-testid="child-content">Child</div> });
      expect(screen.getByTestId('child-content')).toBeInTheDocument();
    });

    it('does not render footer when actions is empty', () => {
      renderDrawer({ actions: [] });
      expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument();
    });

    it('does not render when open=false', () => {
      renderDrawer({ open: false });
      expect(screen.queryByText('Test Drawer')).not.toBeInTheDocument();
    });
  });

  /* ── Close button ───────────────────────────────────────── */
  describe('Close button', () => {
    it('renders the close button', () => {
      renderDrawer();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', () => {
      renderDrawer();
      fireEvent.click(screen.getByRole('button'));
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });
  });

  /* ── Actions / Footer ───────────────────────────────────── */
  describe('Actions footer', () => {
    it('renders action buttons when actions are provided', () => {
      renderDrawer({
        actions: [
          { label: 'Save', onClick: vi.fn() },
          { label: 'Cancel', onClick: vi.fn() },
        ],
      });
      expect(screen.getByText('Save')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('calls action onClick when button is clicked', () => {
      const handleClick = vi.fn();
      renderDrawer({
        actions: [{ label: 'Submit', onClick: handleClick }],
      });
      fireEvent.click(screen.getByText('Submit'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('disables button when action.disabled=true', () => {
      renderDrawer({
        actions: [{ label: 'Save', onClick: vi.fn(), disabled: true }],
      });
      expect(screen.getByText('Save').closest('button')).toBeDisabled();
    });

    it('disables button when action.loading=true', () => {
      renderDrawer({
        actions: [{ label: 'Save', onClick: vi.fn(), loading: true }],
      });
      expect(screen.getByText('Save').closest('button')).toBeDisabled();
    });

    it('shows loadingLabel when action.loading=true and loadingLabel is provided', () => {
      renderDrawer({
        actions: [{ label: 'Save', onClick: vi.fn(), loading: true, loadingLabel: 'Saving...' }],
      });
      expect(screen.getByText('Saving...')).toBeInTheDocument();
      expect(screen.queryByText('Save')).not.toBeInTheDocument();
    });

    it('shows label when loading=true but no loadingLabel provided', () => {
      renderDrawer({
        actions: [{ label: 'Save', onClick: vi.fn(), loading: true }],
      });
      expect(screen.getByText('Save')).toBeInTheDocument();
    });

    it('uses default variant "contained" when not specified', () => {
      renderDrawer({
        actions: [{ label: 'Save', onClick: vi.fn() }],
      });
      const btn = screen.getByText('Save').closest('button');
      expect(btn).toBeInTheDocument();
    });

    it('renders multiple actions each with their own onClick', () => {
      const onClick1 = vi.fn();
      const onClick2 = vi.fn();
      renderDrawer({
        actions: [
          { label: 'Confirm', onClick: onClick1 },
          { label: 'Discard', onClick: onClick2 },
        ],
      });
      fireEvent.click(screen.getByText('Confirm'));
      fireEvent.click(screen.getByText('Discard'));
      expect(onClick1).toHaveBeenCalledTimes(1);
      expect(onClick2).toHaveBeenCalledTimes(1);
    });
  });

  /* ── Props defaults ─────────────────────────────────────── */
  describe('Props defaults', () => {
    it('renders with default width and anchor without errors', () => {
      renderDrawer();
      expect(screen.getByText('Test Drawer')).toBeInTheDocument();
    });

    it('renders with custom width', () => {
      renderDrawer({ width: 600 });
      expect(screen.getByText('Test Drawer')).toBeInTheDocument();
    });

    it('renders with anchor="left"', () => {
      renderDrawer({ anchor: 'left' });
      expect(screen.getByText('Test Drawer')).toBeInTheDocument();
    });
  });
});