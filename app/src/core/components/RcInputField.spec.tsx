import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import RcInputField from './RcInputField';

const defaultProps = {
  name: 'username',
  value: 'john',
  onChange: vi.fn(),
  onFocus: vi.fn(),
  onBlur: vi.fn(),
  placeholder: 'Enter username',
  autoComplete: 'username',
};

function renderInputField(
  props: Partial<React.ComponentProps<typeof RcInputField>> = {}
) {
  return render(<RcInputField {...defaultProps} {...props} />);
}

describe('RcInputField', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('Rendering', () => {
    it('renders the input value', () => {
      renderInputField();
      expect(screen.getByDisplayValue('john')).toBeInTheDocument();
    });

    it('renders placeholder and autocomplete', () => {
      renderInputField();
      const input = screen.getByPlaceholderText('Enter username');
      expect(input).toHaveAttribute('autocomplete', 'username');
    });

    it('renders start icon when provided', () => {
      renderInputField({ startIcon: <span data-testid="start-icon">I</span> });
      expect(screen.getByTestId('start-icon')).toBeInTheDocument();
    });

    it('applies default maxLength', () => {
      renderInputField();
      expect(screen.getByRole('textbox')).toHaveAttribute('maxlength', '100');
    });
  });

  describe('Interactions', () => {
    it('calls onChange when value changes', () => {
      const onChange = vi.fn();
      renderInputField({ onChange });
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'doe' } });
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('calls onFocus and onBlur', () => {
      const onFocus = vi.fn();
      const onBlur = vi.fn();
      renderInputField({ onFocus, onBlur });
      const input = screen.getByRole('textbox');
      fireEvent.focus(input);
      fireEvent.blur(input);
      expect(onFocus).toHaveBeenCalledTimes(1);
      expect(onBlur).toHaveBeenCalledTimes(1);
    });
  });
});
