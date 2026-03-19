import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import type { VerticalLeftPanelProps } from '@/modules/vertical/types/verticalTypes';

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('@mui/icons-material/Layers', () => ({
  default: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="layers-icon" {...props} />
  ),
}));

vi.mock('@/core/theme/brmsTheme', () => ({
  brmsTheme: {
    colors: { indigoLight: '#6366f1' },
  },
}));

// RcLeftPanel's props are internal to that module — we only care about the
// subset our component passes, so we describe exactly that shape here.
interface RcLeftPanelMockProps {
  variant: string;
  logo: { icon: React.ReactNode; text: string };
  badge: string;
  heroCopy: string;
  features: string[];
  count?: { value: number; label: string };
}

vi.mock('@/core/components/RcLeftPanel', () => ({
  default: ({ variant, logo, badge, heroCopy, features, count }: RcLeftPanelMockProps) => (
    <div data-testid="rc-left-panel">
      <span data-testid="variant">{variant}</span>
      <span data-testid="logo-text">{logo?.text}</span>
      <span data-testid="logo-icon">{logo?.icon}</span>
      <span data-testid="badge">{badge}</span>
      <span data-testid="hero-copy">{heroCopy}</span>
      <ul data-testid="features">
        {features?.map((f: string, i: number) => (
          <li key={i} data-testid={`feature-${i}`}>{f}</li>
        ))}
      </ul>
      {count !== undefined ? (
        <span data-testid="count">
          {count.value}:{count.label}
        </span>
      ) : (
        <span data-testid="count">undefined</span>
      )}
    </div>
  ),
}));

// ── Component under test ───────────────────────────────────────────────────────

import VerticalLeftPanel from './VerticalLeftPanel';

const DEFAULT_DESCRIPTION =
  'Each vertical is an isolated decision domain. Select one to manage its projects, rules, and deployment pipelines.';

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('VerticalLeftPanel', () => {

  // ── Static / structural props ──────────────────────────────────────────────

  describe('static props passed to RcLeftPanel', () => {
    it('renders RcLeftPanel', () => {
      render(<VerticalLeftPanel verticalCount={0} loading={false} />);
      expect(screen.getByTestId('rc-left-panel')).toBeTruthy();
    });

    it('passes variant="create"', () => {
      render(<VerticalLeftPanel verticalCount={0} loading={false} />);
      expect(screen.getByTestId('variant').textContent).toBe('create');
    });

    it('passes logo.text="BRMS Platform"', () => {
      render(<VerticalLeftPanel verticalCount={0} loading={false} />);
      expect(screen.getByTestId('logo-text').textContent).toBe('BRMS Platform');
    });

    it('renders the LayersIcon inside logo.icon', () => {
      render(<VerticalLeftPanel verticalCount={0} loading={false} />);
      expect(screen.getByTestId('layers-icon')).toBeTruthy();
    });

    it('passes badge="Select · Vertical"', () => {
      render(<VerticalLeftPanel verticalCount={0} loading={false} />);
      expect(screen.getByTestId('badge').textContent).toBe('Select · Vertical');
    });

    it('passes exactly 3 features', () => {
      render(<VerticalLeftPanel verticalCount={0} loading={false} />);
      expect(screen.getByTestId('features').children).toHaveLength(3);
    });

    it('passes correct feature[0]', () => {
      render(<VerticalLeftPanel verticalCount={0} loading={false} />);
      expect(screen.getByTestId('feature-0').textContent).toBe(
        'Isolated rule sets per business domain'
      );
    });

    it('passes correct feature[1]', () => {
      render(<VerticalLeftPanel verticalCount={0} loading={false} />);
      expect(screen.getByTestId('feature-1').textContent).toBe(
        'Independent versioning & deployment'
      );
    });

    it('passes correct feature[2]', () => {
      render(<VerticalLeftPanel verticalCount={0} loading={false} />);
      expect(screen.getByTestId('feature-2').textContent).toBe(
        'Role-based access per vertical'
      );
    });
  });

  // ── heroCopy / description ─────────────────────────────────────────────────

  describe('heroCopy', () => {
    it('uses DEFAULT_DESCRIPTION when selectedVerticalDescription is undefined', () => {
      render(<VerticalLeftPanel verticalCount={0} loading={false} />);
      expect(screen.getByTestId('hero-copy').textContent).toBe(DEFAULT_DESCRIPTION);
    });

    it('uses DEFAULT_DESCRIPTION when selectedVerticalDescription is an empty string', () => {
      render(
        <VerticalLeftPanel
          verticalCount={0}
          loading={false}
          selectedVerticalDescription=""
        />
      );
      expect(screen.getByTestId('hero-copy').textContent).toBe(DEFAULT_DESCRIPTION);
    });

    it('uses selectedVerticalDescription when provided', () => {
      render(
        <VerticalLeftPanel
          verticalCount={2}
          loading={false}
          selectedVerticalDescription="Finance domain rules"
        />
      );
      expect(screen.getByTestId('hero-copy').textContent).toBe('Finance domain rules');
    });

    it('overrides default when a non-empty description is given', () => {
      render(
        <VerticalLeftPanel
          verticalCount={1}
          loading={false}
          selectedVerticalDescription="Custom description"
        />
      );
      expect(screen.getByTestId('hero-copy').textContent).not.toBe(DEFAULT_DESCRIPTION);
    });
  });

  // ── count prop ─────────────────────────────────────────────────────────────

  describe('count prop', () => {
    it('passes count=undefined when loading=true', () => {
      render(<VerticalLeftPanel verticalCount={5} loading={true} />);
      expect(screen.getByTestId('count').textContent).toBe('undefined');
    });

    it('passes count with value and label when loading=false', () => {
      render(<VerticalLeftPanel verticalCount={3} loading={false} />);
      expect(screen.getByTestId('count').textContent).toBe('3:vertical');
    });

    it('passes count.value=0 when verticalCount is 0 and not loading', () => {
      render(<VerticalLeftPanel verticalCount={0} loading={false} />);
      expect(screen.getByTestId('count').textContent).toBe('0:vertical');
    });

    it('passes count.label="vertical" regardless of verticalCount', () => {
      render(<VerticalLeftPanel verticalCount={99} loading={false} />);
      expect(screen.getByTestId('count').textContent).toBe('99:vertical');
    });

    it('transitions from undefined count (loading) to defined count (loaded)', () => {
      const { rerender } = render(
        <VerticalLeftPanel verticalCount={0} loading={true} />
      );
      expect(screen.getByTestId('count').textContent).toBe('undefined');

      rerender(<VerticalLeftPanel verticalCount={4} loading={false} />);
      expect(screen.getByTestId('count').textContent).toBe('4:vertical');
    });
  });

  // ── description updates on re-render ──────────────────────────────────────

  describe('re-render behaviour', () => {
    it('updates heroCopy when selectedVerticalDescription changes', () => {
      const { rerender } = render(
        <VerticalLeftPanel verticalCount={2} loading={false} />
      );
      expect(screen.getByTestId('hero-copy').textContent).toBe(DEFAULT_DESCRIPTION);

      rerender(
        <VerticalLeftPanel
          verticalCount={2}
          loading={false}
          selectedVerticalDescription="Health domain"
        />
      );
      expect(screen.getByTestId('hero-copy').textContent).toBe('Health domain');
    });

    it('falls back to DEFAULT_DESCRIPTION when description is cleared', () => {
      const { rerender } = render(
        <VerticalLeftPanel
          verticalCount={2}
          loading={false}
          selectedVerticalDescription="Health domain"
        />
      );
      rerender(<VerticalLeftPanel verticalCount={2} loading={false} />);
      expect(screen.getByTestId('hero-copy').textContent).toBe(DEFAULT_DESCRIPTION);
    });
  });

  // ── prop type contract ─────────────────────────────────────────────────────

  describe('prop type contract', () => {
    it('accepts all required props without type errors', () => {
      const props: VerticalLeftPanelProps = { verticalCount: 3, loading: false };
      render(<VerticalLeftPanel {...props} />);
      expect(screen.getByTestId('rc-left-panel')).toBeTruthy();
    });

    it('accepts optional selectedVerticalDescription without type errors', () => {
      const props: VerticalLeftPanelProps = {
        verticalCount: 1,
        loading: false,
        selectedVerticalDescription: 'A description',
      };
      render(<VerticalLeftPanel {...props} />);
      expect(screen.getByTestId('hero-copy').textContent).toBe('A description');
    });
  });
});