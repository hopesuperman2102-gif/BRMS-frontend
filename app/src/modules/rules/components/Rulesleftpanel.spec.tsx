import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import RulesLeftPanel from './Rulesleftpanel';

const rcLeftPanelMock = vi.fn(({ title, subtitle, statCards, preview, placeholderText }: Record<string, unknown>) => (
  <div>
    <h1>{String(title)}</h1>
    <p>{String(subtitle)}</p>
    <p>{String(placeholderText)}</p>
    <div>{JSON.stringify(statCards)}</div>
    <div>{preview ? JSON.stringify(preview) : 'no-preview'}</div>
  </div>
));

vi.mock('@/core/components/RcLeftPanel', () => ({
  default: (props: Record<string, unknown>) => rcLeftPanelMock(props),
}));

describe('RulesLeftPanel', () => {
  it('passes project counts and hovered rule preview into RcLeftPanel', () => {
    render(
      <RulesLeftPanel
        projectName="Fraud Rules"
        files={[
          { rule_key: 'rule-1', name: 'Velocity' },
          { rule_key: 'rule-2', name: 'Spend' },
        ] as never}
        folders={[
          { path: 'root/a', isTemp: false },
          { path: 'root/temp', isTemp: true },
          { path: 'root/b', isTemp: false },
        ] as never}
        hoveredRule={{ name: 'Velocity', description: 'Checks spending speed' } as never}
      />
    );

    expect(screen.getByText('Fraud Rules')).toBeInTheDocument();
    expect(rcLeftPanelMock).toHaveBeenCalledWith(
      expect.objectContaining({
        statCards: [
          { label: 'Rules', value: 2 },
          { label: 'Folders', value: 2 },
        ],
        preview: {
          name: 'Velocity',
          description: 'Checks spending speed',
        },
      })
    );
  });

  it('falls back to the default title and no preview when nothing is hovered', () => {
    render(
      <RulesLeftPanel
        projectName=""
        files={[] as never}
        folders={[] as never}
        hoveredRule={null}
      />
    );

    expect(screen.getByText('Rules')).toBeInTheDocument();
    expect(rcLeftPanelMock).toHaveBeenCalledWith(
      expect.objectContaining({
        preview: null,
      })
    );
  });
});
