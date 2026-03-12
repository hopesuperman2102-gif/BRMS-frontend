import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EnvironmentHistory } from './EnvironmentHistory';

const activeRulesSpy = vi.fn();

vi.mock('@/modules/deploy/components/ActiveRules', () => ({
  ActiveRules: (props: unknown) => {
    activeRulesSpy(props);
    return <div data-testid="active-rules">Active Rules</div>;
  },
}));

describe('EnvironmentHistory', () => {
  it('renders ActiveRules with expected props', () => {
    const props = {
      rules: [],
      onRevoked: vi.fn(),
      onPromoted: vi.fn(),
      onViewLogs: vi.fn(),
      environment: 'DEV',
      canManageActions: true,
    };

    render(<EnvironmentHistory {...props} />);

    expect(screen.getByTestId('active-rules')).toBeInTheDocument();
    expect(activeRulesSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        ...props,
        delay: 0.7,
      }),
    );
  });
});
