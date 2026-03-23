import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CreateProjectLeftPanel from '@/modules/hub/components/CreateProjectLeftPanel';

// Mock RcLeftPanel
vi.mock('@/core/components/RcLeftPanel', () => ({
  default: (props: any) => (
    <div data-testid="rc-left-panel">
      <span data-testid="variant">{props.variant}</span>
      <span data-testid="backLabel">{props.backLabel}</span>
      <span data-testid="badge">{props.badge}</span>
      <span data-testid="headline">{props.headline}</span>
      <span data-testid="heroCopy">{props.heroCopy}</span>
      <span data-testid="features">{props.features.join(', ')}</span>
      <button onClick={props.onBack}>Back</button>
    </div>
  ),
}));

describe('CreateProjectLeftPanel', () => {
  it('renders correctly in create mode', () => {
    const onBackMock = vi.fn();

    render(
      <CreateProjectLeftPanel isEditMode={false} onBack={onBackMock} />
    );

    expect(screen.getByTestId('variant').textContent).toBe('create');
    expect(screen.getByTestId('backLabel').textContent).toBe('Hub');
    expect(screen.getByTestId('badge').textContent).toBe('New · Project');
    expect(screen.getByTestId('headline').textContent).toBe(
      'Build something\nremarkable.'
    );
    expect(screen.getByTestId('heroCopy').textContent).toContain(
      'Projects are the foundation of rule management'
    );
    expect(screen.getByTestId('features').textContent).toContain(
      'Organize rules into structured folders'
    );
  });

  it('renders correctly in edit mode', () => {
    const onBackMock = vi.fn();

    render(
      <CreateProjectLeftPanel isEditMode={true} onBack={onBackMock} />
    );

    expect(screen.getByTestId('badge').textContent).toBe('Editing · Project');
    expect(screen.getByTestId('headline').textContent).toBe(
      'Refine your\nproject.'
    );
    expect(screen.getByTestId('heroCopy').textContent).toContain(
      'Update your project details'
    );
  });

  it('calls onBack when back button is clicked', () => {
    const onBackMock = vi.fn();

    render(
      <CreateProjectLeftPanel isEditMode={false} onBack={onBackMock} />
    );

    screen.getByText('Back').click();

    expect(onBackMock).toHaveBeenCalledTimes(1);
  });
});