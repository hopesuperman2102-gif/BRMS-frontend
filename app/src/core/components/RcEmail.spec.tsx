import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import RcEmail from './RcEmail';

const defaultProps = {
  value: '',
  onChange: vi.fn(),
  onFocus: vi.fn(),
  onBlur: vi.fn(),
};

function renderEmail(
  props: Partial<React.ComponentProps<typeof RcEmail>> = {}
) {
  return render(<RcEmail {...defaultProps} {...props} />);
}

describe('RcEmail', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('Rendering', () => {
    it('renders default placeholder', () => {
      renderEmail();
      expect(screen.getByPlaceholderText('e.g. john.doe@example.com')).toBeInTheDocument();
    });

    it('renders custom start icon', () => {
      renderEmail({ startIcon: <span data-testid="email-icon">@</span> });
      expect(screen.getByTestId('email-icon')).toBeInTheDocument();
    });

    it('uses email type and autocomplete', () => {
      renderEmail();
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'email');
      expect(input).toHaveAttribute('autocomplete', 'email');
    });
  });

  describe('Validation', () => {
    it('shows required error when blurred empty and required', () => {
      renderEmail({ required: true, value: '' });
      fireEvent.blur(screen.getByRole('textbox'));
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });

    it('shows invalid email error when email format is wrong', () => {
      renderEmail({ value: 'invalid-email' });
      fireEvent.blur(screen.getByRole('textbox'));
      expect(screen.getByText('Enter a valid email address')).toBeInTheDocument();
    });

    it('does not show error for valid email', () => {
      renderEmail({ value: 'john.doe@example.com' });
      fireEvent.blur(screen.getByRole('textbox'));
      expect(screen.queryByText('Enter a valid email address')).not.toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('calls onChange when value changes', () => {
      const onChange = vi.fn();
      renderEmail({ onChange });
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'a@b.com' } });
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('calls onFocus and onBlur callbacks', () => {
      const onFocus = vi.fn();
      const onBlur = vi.fn();
      renderEmail({ onFocus, onBlur });
      const input = screen.getByRole('textbox');
      fireEvent.focus(input);
      fireEvent.blur(input);
      expect(onFocus).toHaveBeenCalledTimes(1);
      expect(onBlur).toHaveBeenCalledTimes(1);
    });

    it('resets touched state when resetKey changes', () => {
      const { rerender } = renderEmail({ value: 'invalid-email' });
      const input = screen.getByRole('textbox');
      fireEvent.blur(input);
      expect(screen.getByText('Enter a valid email address')).toBeInTheDocument();
      rerender(<RcEmail {...defaultProps} value="invalid-email" resetKey={1} />);
      expect(screen.queryByText('Enter a valid email address')).not.toBeInTheDocument();
      });
  });
});
