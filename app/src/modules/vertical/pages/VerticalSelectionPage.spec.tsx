import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import React from 'react';
import type { VerticalView } from '@/modules/vertical/types/verticalEndpointsTypes';
import type { VerticalLeftPanelProps, VerticalRightPanelProps } from '@/modules/vertical/types/verticalTypes';

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('@/modules/vertical/api/verticalsApi', () => ({
  verticalsApi: {
    getVerticalsView: vi.fn(),
  },
}));

vi.mock('@/modules/vertical/components/VerticalRightPanel', () => ({
  default: ({
    verticals,
    loading,
    hoveredKey,
    onCardHover,
    onCardClick,
  }: VerticalRightPanelProps) => (
    <div data-testid="right-panel">
      <span data-testid="rp-loading">{String(loading)}</span>
      <span data-testid="rp-hovered-key">{hoveredKey ?? 'none'}</span>
      {verticals.map((v: VerticalView) => (
        <div key={v.vertical_key}>
          <button
            data-testid={`hover-btn-${v.vertical_key}`}
            onClick={() => onCardHover(v.vertical_key)}
          >
            hover {v.vertical_key}
          </button>
          <button
            data-testid={`click-btn-${v.vertical_key}`}
            onClick={() => onCardClick(v)}
          >
            click {v.vertical_key}
          </button>
        </div>
      ))}
      <button data-testid="hover-null-btn" onClick={() => onCardHover(null)}>
        clear hover
      </button>
    </div>
  ),
}));

vi.mock('@/modules/vertical/components/VerticalLeftPanel', () => ({
  default: ({
    verticalCount,
    loading,
    selectedVerticalDescription,
  }: VerticalLeftPanelProps) => (
    <div data-testid="left-panel">
      <span data-testid="lp-count">{verticalCount}</span>
      <span data-testid="lp-loading">{String(loading)}</span>
      <span data-testid="lp-description">{selectedVerticalDescription ?? 'none'}</span>
    </div>
  ),
}));

vi.mock('@/core/theme/brmsTheme', () => ({
  brmsTheme: {
    colors: { bgRoot: '#fff' },
    fonts: { sans: 'Arial' },
  },
}));

vi.mock('@mui/material', () => ({
  Box: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div {...props}>{children}</div>
  ),
  // styled() returns a no-op wrapper; the style argument is discarded entirely.
  styled:
    (Component: React.ElementType) =>
    () => {
      const Styled = ({
        children,
        ...props
      }: React.HTMLAttributes<HTMLElement>) => (
        <Component {...props}>{children}</Component>
      );
      Styled.displayName = `Styled(${
        typeof Component === 'string'
          ? Component
          : (Component as React.FC).displayName ?? (Component as React.FC).name ?? 'Component'
      })`;
      return Styled;
    },
}));

// ── Imports ───────────────────────────────────────────────────────────────────

import { verticalsApi } from '@/modules/vertical/api/verticalsApi';
import VerticalSelectionPage from './VerticalSelectionPage';

// vi.mocked() narrows from the real function signature to MockedFunction,
// which exposes .mockResolvedValue / .mockReturnValue / .mockRejectedValue.
const mockedGetVerticalsView = vi.mocked(verticalsApi.getVerticalsView);

// ── Fixtures ───────────────────────────────────────────────────────────────────

const MOCK_VERTICALS: VerticalView[] = [
  {
    id: '1',
    vertical_key: 'finance',
    vertical_name: 'Finance',
    description: 'Finance vertical description',
  },
  {
    id: '2',
    vertical_key: 'health',
    vertical_name: 'Health',
    description: 'Health vertical description',
  },
];

const renderPage = () => render(<VerticalSelectionPage />);

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('VerticalSelectionPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Initial loading state ──────────────────────────────────────────────────

  describe('initial loading state', () => {
    it('passes loading=true to both panels before data resolves', () => {
      mockedGetVerticalsView.mockReturnValue(new Promise<VerticalView[]>(() => {}));

      renderPage();

      expect(screen.getByTestId('lp-loading').textContent).toBe('true');
      expect(screen.getByTestId('rp-loading').textContent).toBe('true');
    });

    it('passes verticalCount=0 while loading', () => {
      mockedGetVerticalsView.mockReturnValue(new Promise<VerticalView[]>(() => {}));

      renderPage();

      expect(screen.getByTestId('lp-count').textContent).toBe('0');
    });

    it('passes empty verticals array to RightPanel while loading', () => {
      mockedGetVerticalsView.mockReturnValue(new Promise<VerticalView[]>(() => {}));

      renderPage();

      expect(screen.queryByTestId('click-btn-finance')).toBeNull();
    });
  });

  // ── Successful data fetch ──────────────────────────────────────────────────

  describe('after successful data fetch', () => {
    beforeEach(() => {
      mockedGetVerticalsView.mockResolvedValue(MOCK_VERTICALS);
    });

    it('sets loading=false after fetch completes', async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByTestId('lp-loading').textContent).toBe('false');
        expect(screen.getByTestId('rp-loading').textContent).toBe('false');
      });
    });

    it('passes correct verticalCount to LeftPanel', async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByTestId('lp-count').textContent).toBe('2');
      });
    });

    it('renders a button for each vertical in RightPanel', async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByTestId('click-btn-finance')).toBeTruthy();
        expect(screen.getByTestId('click-btn-health')).toBeTruthy();
      });
    });

    it('calls getVerticalsView exactly once on mount', async () => {
      renderPage();

      await waitFor(() => {
        expect(mockedGetVerticalsView).toHaveBeenCalledTimes(1);
      });
    });
  });

  // ── Failed data fetch ──────────────────────────────────────────────────────

  describe('when data fetch fails', () => {
    it('still sets loading=false after error', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockedGetVerticalsView.mockRejectedValue(new Error('Network error'));

      renderPage();

      await waitFor(() => {
        expect(screen.getByTestId('lp-loading').textContent).toBe('false');
      });

      consoleSpy.mockRestore();
    });

    it('logs the error to console', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const networkError = new Error('Network error');
      mockedGetVerticalsView.mockRejectedValue(networkError);

      renderPage();

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Error fetching verticals:',
          networkError
        );
      });

      consoleSpy.mockRestore();
    });

    it('keeps verticals as empty array after error', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      mockedGetVerticalsView.mockRejectedValue(new Error('fail'));

      renderPage();

      await waitFor(() => {
        expect(screen.getByTestId('lp-count').textContent).toBe('0');
      });
    });
  });

  // ── Hover behaviour ────────────────────────────────────────────────────────

  describe('hover behaviour', () => {
    beforeEach(() => {
      mockedGetVerticalsView.mockResolvedValue(MOCK_VERTICALS);
    });

    it('starts with hoveredKey=null (shown as "none")', async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByTestId('rp-hovered-key').textContent).toBe('none');
      });
    });

    it('updates hoveredKey when a card is hovered', async () => {
      renderPage();

      await waitFor(() => screen.getByTestId('hover-btn-finance'));

      act(() => {
        fireEvent.click(screen.getByTestId('hover-btn-finance'));
      });

      expect(screen.getByTestId('rp-hovered-key').textContent).toBe('finance');
    });

    it('clears hoveredKey when onCardHover(null) is called', async () => {
      renderPage();

      await waitFor(() => screen.getByTestId('hover-btn-finance'));

      act(() => { fireEvent.click(screen.getByTestId('hover-btn-finance')); });
      act(() => { fireEvent.click(screen.getByTestId('hover-null-btn')); });

      expect(screen.getByTestId('rp-hovered-key').textContent).toBe('none');
    });

    it('passes description of the hovered vertical to LeftPanel', async () => {
      renderPage();

      await waitFor(() => screen.getByTestId('hover-btn-finance'));

      act(() => {
        fireEvent.click(screen.getByTestId('hover-btn-finance'));
      });

      expect(screen.getByTestId('lp-description').textContent).toBe(
        'Finance vertical description'
      );
    });

    it('passes undefined description (shown as "none") when no vertical is hovered', async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByTestId('lp-description').textContent).toBe('none');
      });
    });

    it('passes undefined description after hover is cleared', async () => {
      renderPage();

      await waitFor(() => screen.getByTestId('hover-btn-health'));

      act(() => { fireEvent.click(screen.getByTestId('hover-btn-health')); });
      act(() => { fireEvent.click(screen.getByTestId('hover-null-btn')); });

      expect(screen.getByTestId('lp-description').textContent).toBe('none');
    });

    it('switches description when hover moves to a different vertical', async () => {
      renderPage();

      await waitFor(() => screen.getByTestId('hover-btn-finance'));

      act(() => { fireEvent.click(screen.getByTestId('hover-btn-finance')); });
      expect(screen.getByTestId('lp-description').textContent).toBe(
        'Finance vertical description'
      );

      act(() => { fireEvent.click(screen.getByTestId('hover-btn-health')); });
      expect(screen.getByTestId('lp-description').textContent).toBe(
        'Health vertical description'
      );
    });
  });

  // ── Card click / navigation ────────────────────────────────────────────────

  describe('card click navigation', () => {
    beforeEach(() => {
      mockedGetVerticalsView.mockResolvedValue(MOCK_VERTICALS);
    });

    it('navigates to the correct dashboard route on card click', async () => {
      renderPage();

      await waitFor(() => screen.getByTestId('click-btn-finance'));

      act(() => {
        fireEvent.click(screen.getByTestId('click-btn-finance'));
      });

      expect(mockNavigate).toHaveBeenCalledWith(
        '/vertical/finance/dashboard',
        { state: { verticalName: 'Finance' } }
      );
    });

    it('passes vertical_name in navigation state', async () => {
      renderPage();

      await waitFor(() => screen.getByTestId('click-btn-health'));

      act(() => {
        fireEvent.click(screen.getByTestId('click-btn-health'));
      });

      expect(mockNavigate).toHaveBeenCalledWith(
        '/vertical/health/dashboard',
        { state: { verticalName: 'Health' } }
      );
    });

    it('calls navigate exactly once per click', async () => {
      renderPage();

      await waitFor(() => screen.getByTestId('click-btn-finance'));

      act(() => {
        fireEvent.click(screen.getByTestId('click-btn-finance'));
      });

      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });
  });

  // ── getHoveredVerticalDescription edge cases ───────────────────────────────

  describe('getHoveredVerticalDescription edge cases', () => {
    it('returns undefined when no vertical is hovered', async () => {
      mockedGetVerticalsView.mockResolvedValue(MOCK_VERTICALS);
      renderPage();

      await waitFor(() => screen.getByTestId('rp-hovered-key'));

      expect(screen.getByTestId('lp-description').textContent).toBe('none');
    });

    it('passes an empty description string through to LeftPanel as-is', async () => {
      const verticalEmptyDesc: VerticalView[] = [
        { id: '9', vertical_key: 'ops', vertical_name: 'Ops', description: '' },
      ];
      mockedGetVerticalsView.mockResolvedValue(verticalEmptyDesc);

      renderPage();

      await waitFor(() => screen.getByTestId('hover-btn-ops'));

      act(() => {
        fireEvent.click(screen.getByTestId('hover-btn-ops'));
      });
      expect(screen.getByTestId('lp-description').textContent).toBe('');
    });
  });
});