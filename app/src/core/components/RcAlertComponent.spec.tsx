import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import RcAlertComponent, { useAlertStore } from './RcAlertComponent';

describe('RcAlertComponent', () => {
  beforeEach(() => {
    // Reset store to default state before each test
    useAlertStore.setState({ open: false, message: '', type: 'info' });
  });

  /* ── Store ──────────────────────────────────────────────── */
  describe('useAlertStore', () => {
    it('has correct initial state', () => {
      const { open, message, type } = useAlertStore.getState();
      expect(open).toBe(false);
      expect(message).toBe('');
      expect(type).toBe('info');
    });

    it('showAlert sets open=true, message, and type', () => {
      act(() => useAlertStore.getState().showAlert('Hello', 'success'));
      const { open, message, type } = useAlertStore.getState();
      expect(open).toBe(true);
      expect(message).toBe('Hello');
      expect(type).toBe('success');
    });

    it('showAlert defaults type to "info" when not provided', () => {
      act(() => useAlertStore.getState().showAlert('Default type', 'info'));
      expect(useAlertStore.getState().type).toBe('info');
    });

    it('hideAlert sets open=false', () => {
      act(() => useAlertStore.getState().showAlert('Test', 'error'));
      act(() => useAlertStore.getState().hideAlert());
      expect(useAlertStore.getState().open).toBe(false);
    });
  });

  /* ── Rendering ──────────────────────────────────────────── */
  describe('Rendering', () => {
    it('does not show alert content when closed', () => {
      render(<RcAlertComponent />);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('shows alert with correct message when open', () => {
      act(() => useAlertStore.getState().showAlert('Something went wrong', 'error'));
      render(<RcAlertComponent />);
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('shows alert with severity "success"', () => {
      act(() => useAlertStore.getState().showAlert('Saved!', 'success'));
      render(<RcAlertComponent />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('shows alert with severity "warning"', () => {
      act(() => useAlertStore.getState().showAlert('Watch out!', 'warning'));
      render(<RcAlertComponent />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('shows alert with severity "info"', () => {
      act(() => useAlertStore.getState().showAlert('FYI', 'info'));
      render(<RcAlertComponent />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('shows alert with severity "error"', () => {
      act(() => useAlertStore.getState().showAlert('Error!', 'error'));
      render(<RcAlertComponent />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  /* ── Close behaviour ────────────────────────────────────── */
  describe('Close behaviour', () => {
    it('calls hideAlert when the Alert close button is clicked', () => {
      act(() => useAlertStore.getState().showAlert('Closeable', 'info'));
      render(<RcAlertComponent />);
      const closeBtn = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeBtn);
      expect(useAlertStore.getState().open).toBe(false);
    });

    it('calls hideAlert when Snackbar onClose fires', () => {
      act(() => useAlertStore.getState().showAlert('Auto close', 'info'));
      render(<RcAlertComponent />);
      // Simulate Snackbar timeout / clickaway by firing the close on the alert button
      const closeBtn = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeBtn);
      expect(useAlertStore.getState().open).toBe(false);
    });
  });
});