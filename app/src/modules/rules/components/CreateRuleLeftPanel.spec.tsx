import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CreateRuleLeftPanel from './CreateRuleLeftPanel';

const rcLeftPanelMock = vi.fn(({ badge, headline, heroCopy, features, onBack }: Record<string, unknown>) => (
  <div>
    <div>{String(badge)}</div>
    <div>{String(headline)}</div>
    <div>{String(heroCopy)}</div>
    <button onClick={onBack as () => void}>Back</button>
    <ul>
      {(features as string[]).map((feature) => <li key={feature}>{feature}</li>)}
    </ul>
  </div>
));

vi.mock('@/core/components/RcLeftPanel', () => ({
  default: (props: Record<string, unknown>) => rcLeftPanelMock(props),
}));

describe('CreateRuleLeftPanel', () => {
  it('renders create-mode copy', () => {
    render(<CreateRuleLeftPanel isEditMode={false} onBack={vi.fn()} />);

    expect(screen.getByText('New · Rule')).toBeInTheDocument();
    expect(screen.getByText('Define your logic.')).toBeInTheDocument();
    expect(screen.getByText(/building blocks of your decision engine/i)).toBeInTheDocument();
    expect(screen.getByText('Folder-based rule organisation')).toBeInTheDocument();
  });

  it('renders edit-mode copy and passes the back handler through', () => {
    const onBack = vi.fn();

    render(<CreateRuleLeftPanel isEditMode onBack={onBack} />);

    expect(screen.getByText('Editing · Rule')).toBeInTheDocument();
    expect(screen.getByText('Refine your rule.')).toBeInTheDocument();

    expect(rcLeftPanelMock).toHaveBeenCalledWith(
      expect.objectContaining({
        backLabel: 'Rules',
        onBack,
      })
    );
  });
});
