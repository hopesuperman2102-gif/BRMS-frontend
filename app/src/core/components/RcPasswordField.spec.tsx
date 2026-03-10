import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import RcPasswordField from './RcPasswordField';

const defaultProps = {
  name: 'password',
  value: 'secret123',
  onChange: vi.fn(),
  onFocus: vi.fn(),
  onBlur: vi.fn(),
};

function renderPasswordField(
  props: Partial<React.ComponentProps<typeof RcPasswordField>> = {}
) {
  return render(<RcPasswordField {...defaultProps} {...props} />);
}

describe('RcPasswordField', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('Rendering', () => {
    it('renders password input by default', () => {
      renderPasswordField();
      expect(screen.getByDisplayValue('secret123')).toHaveAttribute('type', 'password');
    });

    it('renders start icon when provided', () => {
      renderPasswordField({ startIcon: <span data-testid="lock-icon">L</span> });
      expect(screen.getByTestId('lock-icon')).toBeInTheDocument();
    });

    it('applies default maxLength and autocomplete', () => {
      renderPasswordField();
      const input = screen.getByDisplayValue('secret123');
      expect(input).toHaveAttribute('maxlength', '128');
      expect(input).toHaveAttribute('autocomplete', 'current-password');
    });
  });

  describe('Interactions', () => {
    it('toggles password visibility', () => {
      renderPasswordField();
      const input = screen.getByDisplayValue('secret123');
      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(input).toHaveAttribute('type', 'text');
      fireEvent.click(button);
      expect(input).toHaveAttribute('type', 'password');
    });

    it('calls onChange, onFocus and onBlur', () => {
      const onChange = vi.fn();
      const onFocus = vi.fn();
      const onBlur = vi.fn();
      renderPasswordField({ onChange, onFocus, onBlur });
      const input = screen.getByDisplayValue('secret123');
      fireEvent.change(input, { target: { value: 'updated-secret' } });
      fireEvent.focus(input);
      fireEvent.blur(input);
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onFocus).toHaveBeenCalledTimes(1);
      expect(onBlur).toHaveBeenCalledTimes(1);
    });
  });
});
