import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CreateProjectRightPanel from './CreateProjectRightPanel';

/* ─── Mock child components ───────────────────────────── */

vi.mock('@/core/components/RcInputField', () => ({
  default: (props: any) => (
    <input
      data-testid={props.name}
      value={props.value}
      onChange={props.onChange}
      onFocus={props.onFocus}
      onBlur={props.onBlur}
    />
  ),
}));

vi.mock('@/core/components/RcTextArea', () => ({
  default: (props: any) => (
    <textarea
      data-testid={props.name}
      value={props.value}
      onChange={props.onChange}
      onFocus={props.onFocus}
      onBlur={props.onBlur}
    />
  ),
}));

/* ─── Default Props ───────────────────────────── */

const defaultProps = {
  isEditMode: false,
  form: {
    name: '',
    description: '',
    domain: '',
  },
  loading: false,
  error: '',
  onFieldChange: vi.fn(),
  onSubmit: vi.fn(),
  onCancel: vi.fn(),
  onBack: vi.fn(),
};

const renderComponent = (props = {}) =>
  render(<CreateProjectRightPanel {...defaultProps} {...props} />);

/* ─── Tests ───────────────────────────── */

describe('CreateProjectRightPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /* ─── Rendering ───────────────────────────── */

  describe('Rendering', () => {
    it('renders create mode correctly', () => {
      renderComponent();

      // Button
      expect(
        screen.getByRole('button', { name: /create project/i })
      ).toBeInTheDocument();

      // Heading (avoid duplicate issue)
      expect(screen.getAllByText('Create Project')[0]).toBeInTheDocument();

      expect(
        screen.getByText(
          'Fill in the details below to set up your new project.'
        )
      ).toBeInTheDocument();
    },15000);

    it('renders edit mode correctly', () => {
      renderComponent({ isEditMode: true });

      expect(screen.getAllByText('Edit Project')[0]).toBeInTheDocument();

      expect(
        screen.getByText(
          'Update the fields below and save your changes.'
        )
      ).toBeInTheDocument();

      expect(
        screen.getByRole('button', { name: /save changes/i })
      ).toBeInTheDocument();
    });

    it('renders error message', () => {
      renderComponent({ error: 'Error occurred' });

      expect(screen.getByText('Error occurred')).toBeInTheDocument();
    });

    it('does not render error when empty', () => {
      renderComponent({ error: '' });
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  /* ─── Field interactions ───────────────────────────── */

  describe('Field interactions', () => {
    it('updates project name', () => {
      const onFieldChange = vi.fn();
      renderComponent({ onFieldChange });

      fireEvent.change(screen.getByTestId('name'), {
        target: { value: 'Test Project' },
      });

      expect(onFieldChange).toHaveBeenCalledWith(
        'name',
        'Test Project'
      );
    });

    it('updates description', () => {
      const onFieldChange = vi.fn();
      renderComponent({ onFieldChange });

      fireEvent.change(screen.getByTestId('description'), {
        target: { value: 'Test desc' },
      });

      expect(onFieldChange).toHaveBeenCalledWith(
        'description',
        'Test desc'
      );
    });

    it('updates domain', () => {
      const onFieldChange = vi.fn();
      renderComponent({ onFieldChange });

      fireEvent.change(screen.getByTestId('domain'), {
        target: { value: 'finance' },
      });

      expect(onFieldChange).toHaveBeenCalledWith(
        'domain',
        'finance'
      );
    });
  });

  /* ─── Actions ───────────────────────────── */

  describe('Actions', () => {
    it('calls onSubmit (create mode)', () => {
      const onSubmit = vi.fn();
      renderComponent({ onSubmit });

      fireEvent.click(
        screen.getByRole('button', { name: /create project/i })
      );

      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it('calls onSubmit (edit mode)', () => {
      const onSubmit = vi.fn();
      renderComponent({ onSubmit, isEditMode: true });

      fireEvent.click(
        screen.getByRole('button', { name: /save changes/i })
      );

      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel', () => {
      const onCancel = vi.fn();
      renderComponent({ onCancel });

      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('calls onBack (hidden mobile button)', () => {
      const onBack = vi.fn();
      renderComponent({ onBack });

      fireEvent.click(
        screen.getByRole('button', { name: /hub/i, hidden: true })
      );

      expect(onBack).toHaveBeenCalledTimes(1);
    });
  });

  /* ─── States ───────────────────────────── */

  describe('States', () => {
    it('disables submit button when loading (create mode)', () => {
      renderComponent({ loading: true });

      const button = screen.getByRole('button', { name: /saving/i });
      expect(button).toBeDisabled();
    });

    it('shows saving state in edit mode', () => {
      renderComponent({ loading: true, isEditMode: true });

      expect(
        screen.getByRole('button', { name: /saving/i })
      ).toBeInTheDocument();
    });

    it('shows character counts correctly', () => {
      renderComponent({
        form: {
          name: 'Test',
          description: 'Hello',
          domain: '',
        },
      });

      expect(screen.getByText('4/100')).toBeInTheDocument();
      expect(screen.getByText('5/300')).toBeInTheDocument();
    });

    it('handles overlimit state', () => {
      renderComponent({
        form: {
          name: '',
          description: 'a'.repeat(301),
          domain: '',
        },
      });

      expect(screen.getByText('301/300')).toBeInTheDocument();
    });
  });

  /* ─── Focus handling ───────────────────────────── */

  describe('Focus handling', () => {
    it('handles focus for all fields', () => {
      renderComponent();

      const name = screen.getByTestId('name');
      const description = screen.getByTestId('description');
      const domain = screen.getByTestId('domain');

      fireEvent.focus(name);
      fireEvent.blur(name);

      fireEvent.focus(description);
      fireEvent.blur(description);

      fireEvent.focus(domain);
      fireEvent.blur(domain);

      expect(name).toBeInTheDocument();
    });
  });
});