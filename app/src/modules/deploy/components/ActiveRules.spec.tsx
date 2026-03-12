import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ActiveRules } from './ActiveRules';

const { revokeRule, promoteRule, showAlert } = vi.hoisted(() => ({
  revokeRule: vi.fn(),
  promoteRule: vi.fn(),
  showAlert: vi.fn(),
}));

vi.mock('framer-motion', () => ({
  motion: Object.assign(
    (Component: React.ElementType) => Component,
    {
      div: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    },
  ),
}));

vi.mock('@/modules/deploy/api/deployApi', () => ({
  deployApi: {
    revokeRule,
    promoteRule,
  },
}));

vi.mock('@/core/components/RcCard', () => ({
  RcCard: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardHeader: ({ title }: { title: string }) => <div>{title}</div>,
}));

vi.mock('@/core/components/RcAlertComponent', () => ({
  useAlertStore: () => ({ showAlert }),
}));

vi.mock('@/core/components/RcConfirmDailog', () => ({
  __esModule: true,
  default: ({
    open,
    title,
    message,
    onConfirm,
    onCancel,
  }: {
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
  }) => open ? (
    <div>
      <div>{title}</div>
      <div>{message}</div>
      <button type="button" onClick={onConfirm}>confirm-revoke</button>
      <button type="button" onClick={onCancel}>cancel-revoke</button>
    </div>
  ) : null,
}));

describe('ActiveRules', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  const defaultRule = {
    rule_key: 'rule-1',
    rule_name: 'Rule One',
    version: 'v1',
    environment: 'DEV',
    deployable_env: ['QA', 'PROD'],
  };

  it('renders empty state and view logs action', () => {
    const onViewLogs = vi.fn();
    render(
      <ActiveRules
        rules={[]}
        onRevoked={vi.fn()}
        onPromoted={vi.fn()}
        onViewLogs={onViewLogs}
        environment="DEV"
      />,
    );

    expect(screen.getByText('No deployed rules found')).toBeInTheDocument();
    fireEvent.click(screen.getByText('View Logs'));
    expect(onViewLogs).toHaveBeenCalledWith('');
  });

  it('shows permission alert when revoke is blocked', () => {
    render(
      <ActiveRules
        rules={[defaultRule]}
        onRevoked={vi.fn()}
        onPromoted={vi.fn()}
        onViewLogs={vi.fn()}
        environment="DEV"
        canManageActions={false}
      />,
    );

    fireEvent.click(screen.getByText('Revoke'));
    expect(showAlert).toHaveBeenCalledWith('You do not have permission to revoke rules.', 'info');
  });

  it('shows permission alert when promote is blocked', () => {
    render(
      <ActiveRules
        rules={[defaultRule]}
        onRevoked={vi.fn()}
        onPromoted={vi.fn()}
        onViewLogs={vi.fn()}
        environment="DEV"
        canManageActions={false}
      />,
    );

    fireEvent.click(screen.getByText('Promote'));
    expect(showAlert).toHaveBeenCalledWith('You do not have permission to promote rules.', 'info');
  });

  it('revokes a rule after confirmation', async () => {
    const onRevoked = vi.fn();
    revokeRule.mockResolvedValueOnce(undefined);

    render(
      <ActiveRules
        rules={[defaultRule]}
        onRevoked={onRevoked}
        onPromoted={vi.fn()}
        onViewLogs={vi.fn()}
        environment="DEV"
      />,
    );

    fireEvent.click(screen.getByText('Revoke'));
    fireEvent.click(screen.getByText('confirm-revoke'));

    await waitFor(() => {
      expect(revokeRule).toHaveBeenCalledWith('rule-1', 'v1', 'DEV');
      expect(onRevoked).toHaveBeenCalled();
    });
  });

  it('handles revoke failure without calling onRevoked', async () => {
    const onRevoked = vi.fn();
    revokeRule.mockRejectedValueOnce(new Error('revoke failed'));

    render(
      <ActiveRules
        rules={[defaultRule]}
        onRevoked={onRevoked}
        onPromoted={vi.fn()}
        onViewLogs={vi.fn()}
        environment="DEV"
      />,
    );

    fireEvent.click(screen.getByText('Revoke'));
    fireEvent.click(screen.getByText('confirm-revoke'));

    await waitFor(() => expect(revokeRule).toHaveBeenCalled());
    expect(onRevoked).not.toHaveBeenCalled();
  });

  it('opens promote dialog and submits promotion', async () => {
    const onPromoted = vi.fn();
    promoteRule.mockResolvedValueOnce(undefined);

    render(
      <ActiveRules
        rules={[defaultRule]}
        onRevoked={vi.fn()}
        onPromoted={onPromoted}
        onViewLogs={vi.fn()}
        environment="DEV"
      />,
    );

    fireEvent.click(screen.getByText('Promote'));
    expect(screen.getByText('Promote Rule')).toBeInTheDocument();
    fireEvent.click(screen.getByText('PROD'));
    fireEvent.click(screen.getByRole('button', { name: 'Promote to PROD' }));

    await waitFor(() => {
      expect(promoteRule).toHaveBeenCalledWith('rule-1', 'PROD', 'DEV');
      expect(onPromoted).toHaveBeenCalledWith('PROD');
    });
  }, 15000);
});
