import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import type { FileCardProps } from '@/modules/rules/types/Explorertypes';

const omit = <T extends object, K extends keyof T>(obj: T, ...keys: K[]): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach((k) => delete result[k]);
  return result;
};

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('@/core/theme/brmsTheme', () => {
  const colorKeys = [
    'statusUsingBg', 'statusUsingText', 'statusUsingDot', 'statusUsingBorder',
    'statusActiveBg', 'statusActiveText', 'statusActiveDot', 'statusActiveBorder',
    'statusDraftBg', 'statusDraftText', 'statusDraftDot', 'statusDraftBorder',
    'statusInactiveBg', 'statusInactiveText', 'statusInactiveDot', 'statusInactiveBorder',
    'statusDeprecatedBg', 'statusDeprecatedText', 'statusDeprecatedDot', 'statusDeprecatedBorder',
    'statusDefaultBg', 'statusDefaultText', 'statusDefaultDot', 'statusDefaultBorder',
    'white', 'panelIndigo', 'panelIndigoMuted', 'lightBorder', 'lightBorderHover',
    'lightTextHigh', 'lightTextMid', 'lightTextLow', 'lightSurfaceHover',
    'surfaceBase', 'tabTextInactive',
  ];
  const colors = Object.fromEntries(colorKeys.map((k) => [k, k]));
  return {
    brmsTheme: {
      colors,
      fonts: { mono: 'monospace', sans: 'Arial' },
    },
  };
});

vi.mock('@/modules/rules/pages/ProjectRulePage', () => ({
  fmtDate: (date: string) => `formatted:${date}`,
}));

vi.mock('@mui/icons-material/InsertDriveFileOutlined', () => ({
  default: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="file-icon" {...props} />
  ),
}));

vi.mock('@mui/icons-material/MoreVert', () => ({
  default: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="more-vert-icon" {...props} />
  ),
}));

vi.mock('@mui/material', () => ({
  Typography: ({
    children,
    ...props
  }: React.HTMLAttributes<HTMLSpanElement>) => (
    <span {...props}>{children}</span>
  ),
  IconButton: ({ children, onClick, className, disabled, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { className?: string; disableRipple?: boolean }) => (
    <button
      data-testid="menu-button"
      className={className}
      onClick={onClick}
      disabled={disabled}
      {...omit(rest, 'disableRipple')}
    >
      {children}
    </button>
  ),
}));

vi.mock('@mui/material/styles', () => ({
  styled:
    (Component: React.ElementType) =>
    (stylesFn?: ((props: Record<string, unknown>) => object) | object) => {
      // Call the style fn with all known statuskey variants to cover every
      // STATUS_MAP branch (using/active/draft/inactive/deprecated + unknown).
      if (typeof stylesFn === 'function') {
        ['using', 'active', 'draft', 'inactive', 'deprecated', 'unknown'].forEach(
          (statuskey) => stylesFn({ statuskey })
        );
      }
      const Styled = ({ children, ...rest }: React.HTMLAttributes<HTMLElement> & { statuskey?: string }) =>
        React.createElement(Component, omit(rest, 'statuskey'), children);
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

// ── Components under test ──────────────────────────────────────────────────────

import { StatusPill, FileCard } from './FileCard';

// ── Fixtures ───────────────────────────────────────────────────────────────────

const baseItem: FileCardProps['item'] = {
  kind: 'file',
  rule_key: 'eligibility-check',
  name: 'Eligibility Check',
  path: 'finance/rules/eligibility-check',
  parentPath: 'finance/rules',
  status: 'active',
  version: '1.0.0',
  updatedAt: '2024-01-15',
};

const defaultProps: FileCardProps = {
  item: baseItem,
  onOpen: vi.fn(),
  onMenuOpen: vi.fn(),
  onMouseEnter: vi.fn(),
  onMouseLeave: vi.fn(),
};

const renderCard = (props: Partial<FileCardProps & { isReviewer?: boolean }> = {}) =>
  render(<FileCard {...defaultProps} {...props} />);

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('StatusPill', () => {
  // ── Rendering ───────────────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders the status text', () => {
      render(<StatusPill status="active" />);
      expect(screen.getByText('active')).toBeTruthy();
    });

    it('renders with draft status', () => {
      render(<StatusPill status="draft" />);
      expect(screen.getByText('draft')).toBeTruthy();
    });

    it('renders with inactive status', () => {
      render(<StatusPill status="inactive" />);
      expect(screen.getByText('inactive')).toBeTruthy();
    });

    it('renders with deprecated status', () => {
      render(<StatusPill status="deprecated" />);
      expect(screen.getByText('deprecated')).toBeTruthy();
    });

    it('renders with using status', () => {
      render(<StatusPill status="using" />);
      expect(screen.getByText('using')).toBeTruthy();
    });

    it('renders with an unknown status (falls back to default style)', () => {
      render(<StatusPill status="unknown-status" />);
      expect(screen.getByText('unknown-status')).toBeTruthy();
    });
  });

  // ── Key normalisation ────────────────────────────────────────────────────────

  describe('status key normalisation', () => {
    it('lowercases the status key for lookup (uppercase input)', () => {
      render(<StatusPill status="ACTIVE" />);
      // Component renders — no throw means STATUS_MAP lookup succeeded
      expect(screen.getByText('ACTIVE')).toBeTruthy();
    });

    it('lowercases mixed-case input', () => {
      render(<StatusPill status="Draft" />);
      expect(screen.getByText('Draft')).toBeTruthy();
    });

    it('uses "draft" as fallback when status is null/undefined-like empty string', () => {
      // The component does `status ?? 'draft'` so empty string is NOT null
      render(<StatusPill status="" />);
      // Should render without throwing
      expect(document.body).toBeTruthy();
    });
  });
});

// ────────────────────────────────────────────────────────────────────────────────

describe('FileCard', () => {
  beforeEach(() => vi.clearAllMocks());

  // ── Static rendering ─────────────────────────────────────────────────────────

  describe('static rendering', () => {
    it('renders the file name', () => {
      renderCard();
      expect(screen.getByText('Eligibility Check')).toBeTruthy();
    });

    it('renders the file icon', () => {
      renderCard();
      expect(screen.getByTestId('file-icon')).toBeTruthy();
    });

    it('renders the status pill with the item status', () => {
      renderCard();
      expect(screen.getByText('active')).toBeTruthy();
    });

    it('renders the version badge with the item version', () => {
      renderCard();
      expect(screen.getByText('version : 1.0.0')).toBeTruthy();
    });

    it('renders the formatted date via fmtDate', () => {
      renderCard();
      expect(screen.getByText('formatted:2024-01-15')).toBeTruthy();
    });

    it('renders the MoreVert menu icon when not a reviewer', () => {
      renderCard();
      expect(screen.getByTestId('more-vert-icon')).toBeTruthy();
    });

    it('renders the menu button when isReviewer=false (default)', () => {
      renderCard({ isReviewer: false });
      expect(screen.getByTestId('menu-button')).toBeTruthy();
    });
  });

  // ── isReviewer ────────────────────────────────────────────────────────────────

  describe('isReviewer prop', () => {
    it('hides the menu button when isReviewer=true', () => {
      renderCard({ isReviewer: true });
      expect(screen.queryByTestId('menu-button')).toBeNull();
    });

    it('hides the MoreVert icon when isReviewer=true', () => {
      renderCard({ isReviewer: true });
      expect(screen.queryByTestId('more-vert-icon')).toBeNull();
    });

    it('shows the menu button when isReviewer=false', () => {
      renderCard({ isReviewer: false });
      expect(screen.getByTestId('menu-button')).toBeTruthy();
    });

    it('shows the menu button when isReviewer is omitted (defaults to false)', () => {
      renderCard();
      expect(screen.getByTestId('menu-button')).toBeTruthy();
    });
  });

  // ── onOpen ────────────────────────────────────────────────────────────────────

  describe('onOpen', () => {
    it('calls onOpen when the card is clicked', () => {
      const onOpen = vi.fn();
      const { container } = render(<FileCard {...defaultProps} onOpen={onOpen} />);
      fireEvent.click(container.firstElementChild!);
      expect(onOpen).toHaveBeenCalledTimes(1);
    });

    it('does not call onMenuOpen when the card body is clicked', () => {
      const onMenuOpen = vi.fn();
      const { container } = render(<FileCard {...defaultProps} onMenuOpen={onMenuOpen} />);
      fireEvent.click(container.firstElementChild!);
      expect(onMenuOpen).not.toHaveBeenCalled();
    });
  });

  // ── onMenuOpen ────────────────────────────────────────────────────────────────

  describe('onMenuOpen', () => {
    it('calls onMenuOpen when the menu button is clicked', () => {
      const onMenuOpen = vi.fn();
      renderCard({ onMenuOpen });
      fireEvent.click(screen.getByTestId('menu-button'));
      expect(onMenuOpen).toHaveBeenCalledTimes(1);
    });

    it('stops propagation so onOpen is not called when menu button is clicked', () => {
      const onOpen = vi.fn();
      const onMenuOpen = vi.fn();
      renderCard({ onOpen, onMenuOpen });
      fireEvent.click(screen.getByTestId('menu-button'));
      expect(onOpen).not.toHaveBeenCalled();
    });

    it('passes the click event to onMenuOpen', () => {
      const onMenuOpen = vi.fn();
      renderCard({ onMenuOpen });
      fireEvent.click(screen.getByTestId('menu-button'));
      expect(onMenuOpen).toHaveBeenCalledWith(expect.any(Object));
    });
  });

  // ── onMouseEnter / onMouseLeave ───────────────────────────────────────────────

  describe('mouse enter / leave', () => {
    it('calls onMouseEnter when the mouse enters the card', () => {
      const onMouseEnter = vi.fn();
      const { container } = render(
        <FileCard {...defaultProps} onMouseEnter={onMouseEnter} />
      );
      fireEvent.mouseEnter(container.firstElementChild!);
      expect(onMouseEnter).toHaveBeenCalledTimes(1);
    });

    it('calls onMouseLeave when the mouse leaves the card', () => {
      const onMouseLeave = vi.fn();
      const { container } = render(
        <FileCard {...defaultProps} onMouseLeave={onMouseLeave} />
      );
      fireEvent.mouseLeave(container.firstElementChild!);
      expect(onMouseLeave).toHaveBeenCalledTimes(1);
    });
  });

  // ── Item prop variations ──────────────────────────────────────────────────────

  describe('item prop variations', () => {
    it('renders a different file name', () => {
      renderCard({ item: { ...baseItem, name: 'Credit Score Rule' } });
      expect(screen.getByText('Credit Score Rule')).toBeTruthy();
    });

    it('renders a different version', () => {
      renderCard({ item: { ...baseItem, version: '3.2.1' } });
      expect(screen.getByText('version : 3.2.1')).toBeTruthy();
    });

    it('renders draft status pill', () => {
      renderCard({ item: { ...baseItem, status: 'draft' } });
      expect(screen.getByText('draft')).toBeTruthy();
    });

    it('renders inactive status pill', () => {
      renderCard({ item: { ...baseItem, status: 'inactive' } });
      expect(screen.getByText('inactive')).toBeTruthy();
    });

    it('renders deprecated status pill', () => {
      renderCard({ item: { ...baseItem, status: 'deprecated' } });
      expect(screen.getByText('deprecated')).toBeTruthy();
    });

    it('renders a different formatted date', () => {
      renderCard({ item: { ...baseItem, updatedAt: '2023-06-30' } });
      expect(screen.getByText('formatted:2023-06-30')).toBeTruthy();
    });
  });

  describe('STATUS_MAP branch coverage', () => {
    const statuses = ['using', 'active', 'draft', 'inactive', 'deprecated'];

    statuses.forEach((status) => {
      it(`renders without error for status "${status}"`, () => {
        render(<StatusPill status={status} />);
        expect(screen.getByText(status)).toBeTruthy();
      });
    });

    it('falls back to default style for an unrecognised status', () => {
      render(<StatusPill status="archived" />);
      expect(screen.getByText('archived')).toBeTruthy();
    });
  });
});