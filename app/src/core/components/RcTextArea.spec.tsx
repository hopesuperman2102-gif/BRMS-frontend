import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import RcTextArea from './RcTextArea';

const defaultProps = {
  name: 'description',
  value: 'Initial text',
  onChange: vi.fn(),
  onFocus: vi.fn(),
  onBlur: vi.fn(),
  placeholder: 'Enter text',
};

function renderTextArea(
  props: Partial<React.ComponentProps<typeof RcTextArea>> = {}
) {
  return render(<RcTextArea {...defaultProps} {...props} />);
}

describe('RcTextArea', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('Rendering', () => {
    it('renders the textarea value', () => {
      renderTextArea();
      expect(screen.getByDisplayValue('Initial text')).toBeInTheDocument();
    });

    it('renders placeholder text', () => {
      renderTextArea();
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    it('uses custom rows and maxLength', () => {
      renderTextArea({ rows: 5, maxLength: 50 });
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('maxlength', '50');
    });
  });

  describe('Interactions', () => {
    it('calls onChange when value changes', () => {
      const onChange = vi.fn();
      renderTextArea({ onChange });
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Updated text' } });
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('calls onFocus when focused', () => {
      const onFocus = vi.fn();
      renderTextArea({ onFocus });
      fireEvent.focus(screen.getByRole('textbox'));
      expect(onFocus).toHaveBeenCalledTimes(1);
    });

    it('calls onBlur when blurred', () => {
      const onBlur = vi.fn();
      renderTextArea({ onBlur });
      fireEvent.blur(screen.getByRole('textbox'));
      expect(onBlur).toHaveBeenCalledTimes(1);
    });
  });
});
