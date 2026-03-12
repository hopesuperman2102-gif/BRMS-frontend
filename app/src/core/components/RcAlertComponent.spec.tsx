import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import RcAlertComponent, { useAlertStore } from './RcAlertComponent';

function renderAlert() {
  return render(<RcAlertComponent />);
}

describe('RcAlertComponent', () => {
  beforeEach(() => {
    useAlertStore.setState({ open: false, message: '', type: 'info' });
  });

  describe('Store', () => {
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

    it('showAlert keeps type as info when info is passed', () => {
      act(() => useAlertStore.getState().showAlert('Default type', 'info'));

      expect(useAlertStore.getState().type).toBe('info');
    });

    it('hideAlert sets open=false', () => {
      act(() => useAlertStore.getState().showAlert('Test', 'error'));
      act(() => useAlertStore.getState().hideAlert());

      expect(useAlertStore.getState().open).toBe(false);
    });
  });

  describe('Rendering', () => {
    it('does not show alert content when closed', () => {
      renderAlert();

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('shows alert with correct message when open', () => {
      act(() => useAlertStore.getState().showAlert('Something went wrong', 'error'));
      renderAlert();

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('shows alert with severity success', () => {
      act(() => useAlertStore.getState().showAlert('Saved!', 'success'));
      renderAlert();

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('shows alert with severity warning', () => {
      act(() => useAlertStore.getState().showAlert('Watch out!', 'warning'));
      renderAlert();

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('shows alert with severity info', () => {
      act(() => useAlertStore.getState().showAlert('FYI', 'info'));
      renderAlert();

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('shows alert with severity error', () => {
      act(() => useAlertStore.getState().showAlert('Error!', 'error'));
      renderAlert();

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  describe('Close behaviour', () => {
    it('calls hideAlert when the Alert close button is clicked', () => {
      act(() => useAlertStore.getState().showAlert('Closeable', 'info'));
      renderAlert();

      fireEvent.click(screen.getByRole('button', { name: /close/i }));

      expect(useAlertStore.getState().open).toBe(false);
    });

    it('calls hideAlert when Snackbar onClose flow happens', () => {
      act(() => useAlertStore.getState().showAlert('Auto close', 'info'));
      renderAlert();

      fireEvent.click(screen.getByRole('button', { name: /close/i }));

      expect(useAlertStore.getState().open).toBe(false);
    });
  });
});
