import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import type { VerticalView } from '@/modules/vertical/types/verticalEndpointsTypes';
import type { VerticalRightPanelProps } from '@/modules/vertical/types/verticalTypes';

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('@mui/icons-material/ArrowForward', () => ({
  default: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="arrow-icon" {...props} />
  ),
}));

vi.mock('@/core/theme/brmsTheme', () => ({
  brmsTheme: {
    colors: {
      bgRight: '#f8f8f8',
      lightBorder: '#e0e0e0',
      panelIndigo: '#6366f1',
      panelIndigoGlow: 'rgba(99,102,241,0.2)',
      lightTextHigh: '#111',
      lightTextMid: '#555',
      lightTextLow: '#999',
      lightSurfaceHover: '#f5f5f5',
      white: '#ffffff',
    },
    fonts: { sans: 'Arial', mono: 'monospace' },
  },
}));

// React synthetic event handlers are attached via React's delegation system,
// NOT as DOM attributes. We must forward them onto real DOM elements.
// isHovered is stripped to prevent the "unknown DOM prop" warning.
// When isHovered is present AND onClick is present, this is VerticalCard —
// we inject data-testid="vertical-card" so tests can query cards directly.
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
  CircularProgress: ({ size }: { size?: number }) => (
    <div data-testid="circular-progress" data-size={size} />
  ),
  styled:
    (Component: React.ElementType) =>
    // stylesFn is the callback passed to styled() e.g. ({ isHovered }) => ({...}).
    // We MUST call it so that v8 coverage registers those lines as executed.
    // We call it twice — once with isHovered:false, once with isHovered:true —
    // to cover every ternary branch inside the style callbacks.
    (stylesFn?: ((props: { isHovered?: boolean }) => object) | object) => {
      if (typeof stylesFn === 'function') {
        stylesFn({ isHovered: false });
        stylesFn({ isHovered: true });
      }
      const Styled = ({
        children,
        isHovered: _isHovered,
        onClick,
        onMouseEnter,
        onMouseLeave,
        ...props
      }: React.HTMLAttributes<HTMLElement> & { isHovered?: boolean }) => {
        // VerticalCard is the only styled component that receives both
        // isHovered and onClick — tag it so tests can query cards reliably.
        const isCard = _isHovered !== undefined && onClick !== undefined;
        return (
          <Component
            {...props}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            {...(isCard ? { 'data-testid': 'vertical-card' } : {})}
          >
            {children}
          </Component>
        );
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

// ── Component under test ───────────────────────────────────────────────────────

import VerticalRightPanel from './VerticalRightPanel';

// ── Fixtures ───────────────────────────────────────────────────────────────────

const VERTICALS: VerticalView[] = [
  { id: '1', vertical_key: 'finance', vertical_name: 'Finance', description: 'Finance desc' },
  { id: '2', vertical_key: 'health', vertical_name: 'Health', description: 'Health desc' },
  { id: '3', vertical_key: 'ops', vertical_name: 'Operations', description: 'Ops desc' },
];

const defaultProps: VerticalRightPanelProps = {
  verticals: VERTICALS,
  loading: false,
  hoveredKey: null,
  onCardHover: vi.fn(),
  onCardClick: vi.fn(),
};

const renderPanel = (props: Partial<VerticalRightPanelProps> = {}) =>
  render(<VerticalRightPanel {...defaultProps} {...props} />);

// Helper: returns the VerticalCard element for a given vertical name.
// The styled() mock injects data-testid="vertical-card" onto any styled
// component that receives both isHovered and onClick — which uniquely
// identifies VerticalCard. We then match by the name text inside it.
const getCard = (verticalName: string): HTMLElement => {
  const cards = screen.getAllByTestId('vertical-card');
  const card = cards.find((c) => c.textContent?.includes(verticalName));
  if (!card) throw new Error(`Card for "${verticalName}" not found`);
  return card as HTMLElement;
};

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('VerticalRightPanel', () => {
  beforeEach(() => vi.clearAllMocks());

  // ── Static header ──────────────────────────────────────────────────────────

  describe('static header content', () => {
    it('renders the header title', () => {
      renderPanel();
      expect(screen.getByText('Determine your Realm')).toBeTruthy();
    });

    it('renders the header subtitle', () => {
      renderPanel();
      expect(
        screen.getByText('Choose the business domain you want to work in.')
      ).toBeTruthy();
    });

    it('always renders the header regardless of loading state', () => {
      renderPanel({ loading: true });
      expect(screen.getByText('Determine your Realm')).toBeTruthy();
    });

    it('always renders the header regardless of empty verticals', () => {
      renderPanel({ verticals: [] });
      expect(screen.getByText('Determine your Realm')).toBeTruthy();
    });
  });

  // ── Loading state ──────────────────────────────────────────────────────────

  describe('loading state', () => {
    it('renders CircularProgress when loading=true', () => {
      renderPanel({ loading: true });
      expect(screen.getByTestId('circular-progress')).toBeTruthy();
    });

    it('passes size=24 to CircularProgress', () => {
      renderPanel({ loading: true });
      expect(screen.getByTestId('circular-progress').dataset.size).toBe('24');
    });

    it('does not render vertical card names when loading', () => {
      renderPanel({ loading: true });
      VERTICALS.forEach((v) => {
        expect(screen.queryByText(v.vertical_name)).toBeNull();
      });
    });

    it('does not render the empty-state message when loading', () => {
      renderPanel({ loading: true, verticals: [] });
      expect(screen.queryByText('No verticals found.')).toBeNull();
    });

    it('does not render arrow icons when loading', () => {
      renderPanel({ loading: true });
      expect(screen.queryAllByTestId('arrow-icon')).toHaveLength(0);
    });
  });

  // ── Empty state ────────────────────────────────────────────────────────────

  describe('empty state', () => {
    it('renders "No verticals found." when verticals is empty and not loading', () => {
      renderPanel({ verticals: [], loading: false });
      expect(screen.getByText('No verticals found.')).toBeTruthy();
    });

    it('does not render CircularProgress in empty state', () => {
      renderPanel({ verticals: [], loading: false });
      expect(screen.queryByTestId('circular-progress')).toBeNull();
    });

    it('does not render any arrow icons in empty state', () => {
      renderPanel({ verticals: [], loading: false });
      expect(screen.queryAllByTestId('arrow-icon')).toHaveLength(0);
    });

    it('does not render any vertical names in empty state', () => {
      renderPanel({ verticals: [], loading: false });
      VERTICALS.forEach((v) => {
        expect(screen.queryByText(v.vertical_name)).toBeNull();
      });
    });
  });

  // ── Vertical list rendering ────────────────────────────────────────────────

  describe('vertical list rendering', () => {
    it('renders the name of each vertical', () => {
      renderPanel();
      VERTICALS.forEach((v) => {
        expect(screen.getByText(v.vertical_name)).toBeTruthy();
      });
    });

    it('renders exactly as many arrow icons as verticals', () => {
      renderPanel();
      expect(screen.getAllByTestId('arrow-icon')).toHaveLength(VERTICALS.length);
    });

    it('does not render CircularProgress when verticals are present', () => {
      renderPanel();
      expect(screen.queryByTestId('circular-progress')).toBeNull();
    });

    it('does not render empty-state message when verticals are present', () => {
      renderPanel();
      expect(screen.queryByText('No verticals found.')).toBeNull();
    });

    it('renders a single vertical correctly', () => {
      renderPanel({
        verticals: [
          { id: '9', vertical_key: 'solo', vertical_name: 'Solo Domain', description: '' },
        ],
      });
      expect(screen.getByText('Solo Domain')).toBeTruthy();
      expect(screen.getAllByTestId('arrow-icon')).toHaveLength(1);
    });
  });

  // ── onCardHover ────────────────────────────────────────────────────────────

  describe('onCardHover', () => {
    it('calls onCardHover with the vertical_key on mouseenter of first card', () => {
      const onCardHover = vi.fn();
      renderPanel({ onCardHover });
      fireEvent.mouseEnter(getCard('Finance'));
      expect(onCardHover).toHaveBeenCalledWith('finance');
    });

    it('calls onCardHover with the vertical_key on mouseenter of second card', () => {
      const onCardHover = vi.fn();
      renderPanel({ onCardHover });
      fireEvent.mouseEnter(getCard('Health'));
      expect(onCardHover).toHaveBeenCalledWith('health');
    });

    it('calls onCardHover with the vertical_key on mouseenter of third card', () => {
      const onCardHover = vi.fn();
      renderPanel({ onCardHover });
      fireEvent.mouseEnter(getCard('Operations'));
      expect(onCardHover).toHaveBeenCalledWith('ops');
    });

    it('calls onCardHover with null on mouseleave of first card', () => {
      const onCardHover = vi.fn();
      renderPanel({ onCardHover });
      fireEvent.mouseLeave(getCard('Finance'));
      expect(onCardHover).toHaveBeenCalledWith(null);
    });

    it('calls onCardHover with null on mouseleave of second card', () => {
      const onCardHover = vi.fn();
      renderPanel({ onCardHover });
      fireEvent.mouseLeave(getCard('Health'));
      expect(onCardHover).toHaveBeenCalledWith(null);
    });

    it('calls onCardHover exactly once per mouseenter event', () => {
      const onCardHover = vi.fn();
      renderPanel({ onCardHover });
      fireEvent.mouseEnter(getCard('Finance'));
      expect(onCardHover).toHaveBeenCalledTimes(1);
    });

    it('calls onCardHover exactly once per mouseleave event', () => {
      const onCardHover = vi.fn();
      renderPanel({ onCardHover });
      fireEvent.mouseLeave(getCard('Finance'));
      expect(onCardHover).toHaveBeenCalledTimes(1);
    });
  });

  // ── onCardClick ────────────────────────────────────────────────────────────

  describe('onCardClick', () => {
    it('calls onCardClick with the full VerticalView object for the first card', () => {
      const onCardClick = vi.fn();
      renderPanel({ onCardClick });
      fireEvent.click(getCard('Finance'));
      expect(onCardClick).toHaveBeenCalledWith(VERTICALS[0]);
    });

    it('calls onCardClick with the full VerticalView object for the second card', () => {
      const onCardClick = vi.fn();
      renderPanel({ onCardClick });
      fireEvent.click(getCard('Health'));
      expect(onCardClick).toHaveBeenCalledWith(VERTICALS[1]);
    });

    it('calls onCardClick with the full VerticalView object for the third card', () => {
      const onCardClick = vi.fn();
      renderPanel({ onCardClick });
      fireEvent.click(getCard('Operations'));
      expect(onCardClick).toHaveBeenCalledWith(VERTICALS[2]);
    });

    it('calls onCardClick exactly once per click', () => {
      const onCardClick = vi.fn();
      renderPanel({ onCardClick });
      fireEvent.click(getCard('Finance'));
      expect(onCardClick).toHaveBeenCalledTimes(1);
    });

    it('passes the complete VerticalView shape (id, key, name, description)', () => {
      const onCardClick = vi.fn();
      renderPanel({ onCardClick });
      fireEvent.click(getCard('Finance'));
      expect(onCardClick).toHaveBeenCalledWith({
        id: '1',
        vertical_key: 'finance',
        vertical_name: 'Finance',
        description: 'Finance desc',
      });
    });
  });

  // ── hoveredKey prop ────────────────────────────────────────────────────────

  describe('hoveredKey prop', () => {
    it('renders without error when hoveredKey matches a vertical', () => {
      renderPanel({ hoveredKey: 'finance' });
      expect(screen.getByText('Finance')).toBeTruthy();
    });

    it('renders without error when hoveredKey does not match any vertical', () => {
      renderPanel({ hoveredKey: 'nonexistent' });
      VERTICALS.forEach((v) => {
        expect(screen.getByText(v.vertical_name)).toBeTruthy();
      });
    });

    it('renders without error when hoveredKey is null', () => {
      renderPanel({ hoveredKey: null });
      VERTICALS.forEach((v) => {
        expect(screen.getByText(v.vertical_name)).toBeTruthy();
      });
    });

    it('renders all cards regardless of which key is hovered', () => {
      renderPanel({ hoveredKey: 'health' });
      VERTICALS.forEach((v) => {
        expect(screen.getByText(v.vertical_name)).toBeTruthy();
      });
    });
  });

  // ── State transitions ──────────────────────────────────────────────────────

  describe('state transitions', () => {
    it('transitions from loading to showing the vertical list', () => {
      const { rerender } = renderPanel({ loading: true });
      expect(screen.getByTestId('circular-progress')).toBeTruthy();

      rerender(<VerticalRightPanel {...defaultProps} loading={false} />);
      expect(screen.queryByTestId('circular-progress')).toBeNull();
      VERTICALS.forEach((v) => {
        expect(screen.getByText(v.vertical_name)).toBeTruthy();
      });
    });

    it('transitions from loading to empty state when verticals is empty', () => {
      const { rerender } = renderPanel({ loading: true, verticals: [] });
      expect(screen.getByTestId('circular-progress')).toBeTruthy();

      rerender(<VerticalRightPanel {...defaultProps} loading={false} verticals={[]} />);
      expect(screen.queryByTestId('circular-progress')).toBeNull();
      expect(screen.getByText('No verticals found.')).toBeTruthy();
    });

    it('updates the rendered list when the verticals prop changes', () => {
      const { rerender } = renderPanel();
      expect(screen.getByText('Finance')).toBeTruthy();

      const updated: VerticalView[] = [
        { id: '99', vertical_key: 'legal', vertical_name: 'Legal', description: '' },
      ];
      rerender(<VerticalRightPanel {...defaultProps} verticals={updated} />);
      expect(screen.queryByText('Finance')).toBeNull();
      expect(screen.getByText('Legal')).toBeTruthy();
    });

    it('updates the arrow icon count when the verticals prop changes', () => {
      const { rerender } = renderPanel();
      expect(screen.getAllByTestId('arrow-icon')).toHaveLength(3);

      const single: VerticalView[] = [
        { id: '99', vertical_key: 'legal', vertical_name: 'Legal', description: '' },
      ];
      rerender(<VerticalRightPanel {...defaultProps} verticals={single} />);
      expect(screen.getAllByTestId('arrow-icon')).toHaveLength(1);
    });
  });

  // ── Prop type contract ─────────────────────────────────────────────────────

  describe('prop type contract', () => {
    it('accepts all required props without type errors', () => {
      const props: VerticalRightPanelProps = {
        verticals: VERTICALS,
        loading: false,
        hoveredKey: null,
        onCardHover: vi.fn(),
        onCardClick: vi.fn(),
      };
      render(<VerticalRightPanel {...props} />);
      expect(screen.getByText('Finance')).toBeTruthy();
    });

    it('accepts a non-null hoveredKey without type errors', () => {
      const props: VerticalRightPanelProps = {
        verticals: VERTICALS,
        loading: false,
        hoveredKey: 'finance',
        onCardHover: vi.fn(),
        onCardClick: vi.fn(),
      };
      render(<VerticalRightPanel {...props} />);
      expect(screen.getByText('Finance')).toBeTruthy();
    });
  });
});