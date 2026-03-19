import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import type { CreateRuleRightPanelProps } from '@/modules/rules/types/rulesTypes';

vi.mock('@mui/icons-material/ArrowBack', () => ({
  default: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="arrow-back-icon" {...props} />
  ),
}));

vi.mock('@/core/theme/brmsTheme', () => ({
  brmsTheme: {
    colors: {
      white: '#ffffff',
      panelIndigo: '#6366f1',
      panelIndigoGlow: 'rgba(99,102,241,0.2)',
      panelIndigoHover: '#4f46e5',
      lightBorder: '#e0e0e0',
      lightBorderHover: '#c0c0c0',
      lightTextHigh: '#111',
      lightTextMid: '#555',
      lightTextLow: '#999',
      lightSurfaceHover: '#f5f5f5',
      formBg: '#fafafa',
      errorBg: '#fff0f0',
      errorBorder: '#fca5a5',
      errorText: '#b91c1c',
      errorIcon: '#ef4444',
      errorRed: '#ef4444',
    },
    fonts: { mono: 'monospace', sans: 'Arial' },
  },
}));

vi.mock('@/core/components/RcInputField', () => ({
  default: ({
    name,
    placeholder,
    value,
    onChange,
    onFocus,
    onBlur,
    maxLength,
  }: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
      data-testid={`input-${name}`}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      maxLength={maxLength}
    />
  ),
}));

vi.mock('@/core/components/RcTextArea', () => ({
  default: ({
    name,
    placeholder,
    value,
    onChange,
    onFocus,
    onBlur,
    maxLength,
    rows,
  }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <textarea
      data-testid={`textarea-${name}`}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      maxLength={maxLength}
      rows={rows}
    />
  ),
}));

vi.mock('@mui/material', () => ({
  Box: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div {...props}>{children}</div>
  ),
  Typography: ({
    children,
    ...props
  }: React.HTMLAttributes<HTMLSpanElement>) => (
    <span {...props}>{children}</span>
  ),
  Button: (allProps: React.ButtonHTMLAttributes<HTMLButtonElement> & { startIcon?: React.ReactNode; disableRipple?: boolean }) => {
    const { children, onClick, disabled, startIcon, ...rest } = allProps;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { disableRipple, ...props } = rest;
    return (
      <button onClick={onClick} disabled={disabled} {...props}>
        {startIcon}
        {children}
      </button>
    );
  },
  Alert: ({
    children,
    ...props
  }: React.HTMLAttributes<HTMLDivElement>) => (
    <div role="alert" data-testid="alert" {...props}>{children}</div>
  ),
}));

vi.mock('@mui/material/styles', () => ({
  styled:
    (Component: React.ElementType) =>

    (stylesFn?: ((props: { overlimit?: boolean }) => object) | object) => {
      if (typeof stylesFn === 'function') {
        stylesFn({ overlimit: false });
        stylesFn({ overlimit: true });
      }
      const Styled = (allProps: React.HTMLAttributes<HTMLElement> & { overlimit?: boolean }) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { children, overlimit, ...props } = allProps;
        return React.createElement(Component, props, children);
      };
      Styled.displayName = `Styled(${
        typeof Component === 'string'
          ? Component
          : (Component as React.FC).displayName ??
            (Component as React.FC).name ??
            'Component'
      })`;
      return Styled;
    },
}));

import CreateRuleRightPanel from './CreateRuleRightPanel';

const defaultForm = {
  name: 'My Rule',
  description: 'A test description',
  directory: 'finance/rules',
};

const defaultProps: CreateRuleRightPanelProps = {
  isEditMode: false,
  form: defaultForm,
  loading: false,
  error: null,
  focused: null,
  locationLabel: 'Finance › Rules',
  onFormChange: vi.fn(),
  onFocus: vi.fn(),
  onBlur: vi.fn(),
  onSubmit: vi.fn(),
  onCancel: vi.fn(),
  onBack: vi.fn(),
};

const renderPanel = (props: Partial<CreateRuleRightPanelProps> = {}) =>
  render(<CreateRuleRightPanel {...defaultProps} {...props} />);

describe('CreateRuleRightPanel', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('create mode', () => {
    it('renders "Create rule" as the form title', () => {
      renderPanel();
      const matches = screen.getAllByText('Create rule');
      expect(matches.some((el) => el.tagName === 'SPAN')).toBe(true);
    });

    it('renders the create-mode subtitle', () => {
      renderPanel();
      expect(
        screen.getByText('Fill in the details below to define your new rule.')
      ).toBeTruthy();
    });

    it('renders "Create rule" as the submit button label', () => {
      renderPanel();
      expect(screen.getByRole('button', { name: 'Create rule' })).toBeTruthy();
    });
  });

  describe('edit mode', () => {
    it('renders "Edit rule" as the form title', () => {
      renderPanel({ isEditMode: true });
      expect(screen.getByText('Edit rule')).toBeTruthy();
    });

    it('renders the edit-mode subtitle', () => {
      renderPanel({ isEditMode: true });
      expect(
        screen.getByText('Update the fields below and save your changes.')
      ).toBeTruthy();
    });

    it('renders "Save changes" as the submit button label', () => {
      renderPanel({ isEditMode: true });
      expect(screen.getByText('Save changes')).toBeTruthy();
    });
  });

  describe('error alert', () => {
    it('renders the alert when error is a non-empty string', () => {
      renderPanel({ error: 'Something went wrong' });
      expect(screen.getByTestId('alert')).toBeTruthy();
      expect(screen.getByText('Something went wrong')).toBeTruthy();
    });

    it('does not render the alert when error is null', () => {
      renderPanel({ error: null });
      expect(screen.queryByTestId('alert')).toBeNull();
    });

    it('does not render the alert when error is an empty string', () => {
      renderPanel({ error: '' });
      expect(screen.queryByTestId('alert')).toBeNull();
    });
  });

  describe('Rule Name field', () => {
    it('renders the name input with the correct value', () => {
      renderPanel();
      const input = screen.getByTestId('input-name') as HTMLInputElement;
      expect(input.value).toBe('My Rule');
    });

    it('renders the correct placeholder', () => {
      renderPanel();
      const input = screen.getByTestId('input-name') as HTMLInputElement;
      expect(input.placeholder).toBe('e.g. Eligibility Check');
    });

    it('calls onFormChange with "name" and the new value on change', () => {
      const onFormChange = vi.fn();
      renderPanel({ onFormChange });
      fireEvent.change(screen.getByTestId('input-name'), {
        target: { value: 'New Rule' },
      });
      expect(onFormChange).toHaveBeenCalledWith('name', 'New Rule');
    });

    it('calls onFocus with "name" on focus', () => {
      const onFocus = vi.fn();
      renderPanel({ onFocus });
      fireEvent.focus(screen.getByTestId('input-name'));
      expect(onFocus).toHaveBeenCalledWith('name');
    });

    it('calls onBlur on blur', () => {
      const onBlur = vi.fn();
      renderPanel({ onBlur });
      fireEvent.blur(screen.getByTestId('input-name'));
      expect(onBlur).toHaveBeenCalledTimes(1);
    });

    it('renders the char count as name.length/100', () => {
      renderPanel({ form: { ...defaultForm, name: 'Hi' } });
      expect(screen.getByText('2/100')).toBeTruthy();
    });

    it('renders 0/100 when name is empty', () => {
      renderPanel({ form: { ...defaultForm, name: '' } });
      expect(screen.getByText('0/100')).toBeTruthy();
    });
  });

  describe('Description field', () => {
    it('renders the description textarea with the correct value', () => {
      renderPanel();
      const textarea = screen.getByTestId('textarea-description') as HTMLTextAreaElement;
      expect(textarea.value).toBe('A test description');
    });

    it('renders the correct placeholder', () => {
      renderPanel();
      const textarea = screen.getByTestId('textarea-description') as HTMLTextAreaElement;
      expect(textarea.placeholder).toBe('Describe what this rule evaluates or decides…');
    });

    it('calls onFormChange with "description" and new value on change', () => {
      const onFormChange = vi.fn();
      renderPanel({ onFormChange });
      fireEvent.change(screen.getByTestId('textarea-description'), {
        target: { value: 'Updated description' },
      });
      expect(onFormChange).toHaveBeenCalledWith('description', 'Updated description');
    });

    it('calls onFocus with "description" on focus', () => {
      const onFocus = vi.fn();
      renderPanel({ onFocus });
      fireEvent.focus(screen.getByTestId('textarea-description'));
      expect(onFocus).toHaveBeenCalledWith('description');
    });

    it('calls onBlur on blur', () => {
      const onBlur = vi.fn();
      renderPanel({ onBlur });
      fireEvent.blur(screen.getByTestId('textarea-description'));
      expect(onBlur).toHaveBeenCalledTimes(1);
    });

    it('renders description char count as description.length/300', () => {
      const desc = 'Hello world'; 
      renderPanel({ form: { ...defaultForm, description: desc } });
      expect(screen.getByText('11/300')).toBeTruthy();
    });

    it('renders 0/300 when description is empty', () => {
      renderPanel({ form: { ...defaultForm, description: '' } });
      expect(screen.getByText('0/300')).toBeTruthy();
    });

    it('renders 300/300 when description is exactly 300 chars', () => {
      const desc = 'a'.repeat(300);
      renderPanel({ form: { ...defaultForm, description: desc } });
      expect(screen.getByText('300/300')).toBeTruthy();
    });

    it('renders overlimit char count when description exceeds 300 chars', () => {
      const desc = 'a'.repeat(301);
      renderPanel({ form: { ...defaultForm, description: desc } });
      expect(screen.getByText('301/300')).toBeTruthy();
    });
  });

  describe('location block', () => {
    it('renders the locationLabel', () => {
      renderPanel();
      expect(screen.getByText('Finance › Rules')).toBeTruthy();
    });

    it('renders the full path with directory and name', () => {
      renderPanel();
      expect(screen.getByText('Full path : finance/rules/My Rule')).toBeTruthy();
    });

    it('shows [rule-name] placeholder when name is empty', () => {
      renderPanel({ form: { ...defaultForm, name: '' } });
      expect(screen.getByText('Full path : finance/rules/[rule-name]')).toBeTruthy();
    });

    it('updates the path when the name changes', () => {
      const { rerender } = renderPanel();
      rerender(
        <CreateRuleRightPanel
          {...defaultProps}
          form={{ ...defaultForm, name: 'New Name' }}
        />
      );
      expect(screen.getByText('Full path : finance/rules/New Name')).toBeTruthy();
    });
  });

  describe('loading state', () => {
    it('renders "Saving…" on the submit button when loading', () => {
      renderPanel({ loading: true });
      expect(screen.getByText('Saving…')).toBeTruthy();
    });

    it('disables the submit button when loading', () => {
      renderPanel({ loading: true });
      const btn = screen.getByText('Saving…').closest('button');
      expect(btn).toBeTruthy();
      expect((btn as HTMLButtonElement).disabled).toBe(true);
    });

    it('does not disable the submit button when not loading', () => {
      renderPanel({ loading: false });
      const btn = screen.getByRole('button', { name: 'Create rule' });
      expect((btn as HTMLButtonElement).disabled).toBe(false);
    });
  });

  describe('button interactions', () => {
    it('calls onCancel when Cancel button is clicked', () => {
      const onCancel = vi.fn();
      renderPanel({ onCancel });
      fireEvent.click(screen.getByText('Cancel'));
      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('calls onSubmit when Submit button is clicked', () => {
      const onSubmit = vi.fn();
      renderPanel({ onSubmit });
      fireEvent.click(screen.getByRole('button', { name: 'Create rule' }));
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it('calls onSubmit when "Save changes" is clicked in edit mode', () => {
      const onSubmit = vi.fn();
      renderPanel({ isEditMode: true, onSubmit });
      fireEvent.click(screen.getByText('Save changes'));
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it('calls onBack when the mobile back button is clicked', () => {
      const onBack = vi.fn();
      renderPanel({ onBack });
      fireEvent.click(screen.getByText('Rules'));
      expect(onBack).toHaveBeenCalledTimes(1);
    });

    it('does not call onSubmit when the button is disabled (loading)', () => {
      const onSubmit = vi.fn();
      renderPanel({ loading: true, onSubmit });
      const btn = screen.getByText('Saving…').closest('button') as HTMLButtonElement;
      fireEvent.click(btn);
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('mobile back button', () => {
    it('renders the "Rules" back button label', () => {
      renderPanel();
      expect(screen.getByText('Rules')).toBeTruthy();
    });

    it('renders the ArrowBack icon', () => {
      renderPanel();
      expect(screen.getByTestId('arrow-back-icon')).toBeTruthy();
    });
  });

  describe('inputSx (via focused prop)', () => {
    it('renders without error when focused is "name"', () => {
      renderPanel({ focused: 'name' });
      expect(screen.getByTestId('input-name')).toBeTruthy();
    });

    it('renders without error when focused is "description"', () => {
      renderPanel({ focused: 'description' });
      expect(screen.getByTestId('textarea-description')).toBeTruthy();
    });

    it('renders without error when focused is null', () => {
      renderPanel({ focused: null });
      expect(screen.getByTestId('input-name')).toBeTruthy();
    });
  });

  describe('prop type contract', () => {
    it('accepts all required props without type errors', () => {
      const props: CreateRuleRightPanelProps = { ...defaultProps };
      render(<CreateRuleRightPanel {...props} />);
      expect(screen.getByRole('button', { name: 'Create rule' })).toBeTruthy();
    });

    it('accepts isEditMode=true without type errors', () => {
      const props: CreateRuleRightPanelProps = { ...defaultProps, isEditMode: true };
      render(<CreateRuleRightPanel {...props} />);
      expect(screen.getByText('Edit rule')).toBeTruthy();
    });
  });
});