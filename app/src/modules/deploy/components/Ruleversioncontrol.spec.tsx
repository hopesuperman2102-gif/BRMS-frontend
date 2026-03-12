import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RuleVersionControl } from './Ruleversioncontrol';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/core/components/RcCard', () => ({
  RcCard: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardHeader: ({ title }: { title: string }) => <div>{title}</div>,
}));

describe('RuleVersionControl', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state', () => {
    render(
      <RuleVersionControl
        rules={[]}
        selectedRules={new Set()}
        selectedVersions={new Map()}
        onToggleRule={vi.fn()}
        onVersionChange={vi.fn()}
        isLoading
      />,
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders empty state', () => {
    render(
      <RuleVersionControl
        rules={[]}
        selectedRules={new Set()}
        selectedVersions={new Map()}
        onToggleRule={vi.fn()}
        onVersionChange={vi.fn()}
      />,
    );

    expect(screen.getByText('No undeployed approved rules')).toBeInTheDocument();
  });

  it('groups versions and toggles a rule', () => {
    const onToggleRule = vi.fn();
    render(
      <RuleVersionControl
        rules={[
          { rule_key: 'rule-1', rule_name: 'Rule One', version: 'v1' },
          { rule_key: 'rule-1', rule_name: 'Rule One', version: 'v2' },
        ]}
        selectedRules={new Set()}
        selectedVersions={new Map()}
        onToggleRule={onToggleRule}
        onVersionChange={vi.fn()}
      />,
    );

    expect(screen.getByText('Rule One')).toBeInTheDocument();
    expect(screen.getByText('2 versions available')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Rule One'));
    expect(onToggleRule).toHaveBeenCalledWith('rule-1');
  });

  it('opens version picker and changes version', async () => {
    const onVersionChange = vi.fn();
    render(
      <RuleVersionControl
        rules={[
          { rule_key: 'rule-1', rule_name: 'Rule One', version: 'v1' },
          { rule_key: 'rule-1', rule_name: 'Rule One', version: 'v2' },
        ]}
        selectedRules={new Set(['rule-1'])}
        selectedVersions={new Map([['rule-1', 'v1']])}
        onToggleRule={vi.fn()}
        onVersionChange={onVersionChange}
      />,
    );

    fireEvent.click(screen.getByText('v1'));
    await waitFor(() => expect(screen.getByText('v2')).toBeInTheDocument());
    fireEvent.click(screen.getByText('v2'));

    expect(onVersionChange).toHaveBeenCalledWith('rule-1', 'v2');
  });
});
