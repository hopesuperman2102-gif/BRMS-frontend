import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import LoginLeftPanel from './Loginleftpanel';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
  usePathname: () => '/',
}));

vi.mock('@/core/theme/brmsTheme', () => ({
  brmsTheme: {
    colors: {
      panelBg: '#0f0f1a',
      panelBorder: 'rgba(255,255,255,0.07)',
      panelIndigo: '#6366f1',
      panelIndigoGlow: 'rgba(99,102,241,0.5)',
      panelTextMid: 'rgba(255,255,255,0.55)',
      panelTextLow: 'rgba(255,255,255,0.3)',
      textOnPrimary: '#ffffff',
    },
    fonts: {
      mono: '"JetBrains Mono", monospace',
    },
  },
}));

vi.mock('@mui/icons-material/ArrowBack', () => ({
  default: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="ArrowBackIcon" {...props} />
  ),
}));

function getByTextContent(
  container: HTMLElement,
  matcher: string | RegExp,
): HTMLElement {
  const allElements = Array.from(
    container.querySelectorAll('*'),
  ) as HTMLElement[];
  const match = allElements.find((el) => {
    const text = el.textContent ?? '';
    return typeof matcher === 'string'
      ? text.trim() === matcher.trim()
      : matcher.test(text);
  });
  if (!match) {
    throw new Error(`Unable to find element with text content: ${matcher}`);
  }
  return match;
}

describe('LoginLeftPanel', () => {
  let container: HTMLElement;
  let errorSpy: ReturnType<typeof vi.spyOn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    ({ container } = render(<LoginLeftPanel />));
  });

  afterEach(() => {
    errorSpy.mockRestore();
    warnSpy.mockRestore();
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      expect(container.firstChild).toBeTruthy();
    });

    it('renders the mode badge containing "Secure"', () => {
      expect(getByTextContent(container, /secure/i)).toBeTruthy();
    });

    it('renders the mode badge containing "Authentication"', () => {
      expect(getByTextContent(container, /authentication/i)).toBeTruthy();
    });

    it('renders the headline containing "Welcome"', () => {
      expect(getByTextContent(container, /welcome/i)).toBeTruthy();
    });

    it('renders the sub-copy paragraph', () => {
      expect(
        getByTextContent(container, /sign in to manage your rule sets/i),
      ).toBeTruthy();
    });
  });

  describe('Feature list', () => {
    const features = [
      'Centralized rule management across projects',
      'Role-based access & team collaboration',
      'Version history & deployment tracking',
    ] as const;

    it.each(features)('renders feature item: "%s"', (label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });

    it('renders exactly 3 feature items', () => {
      const found = features.filter((l) => screen.queryByText(l) !== null);
      expect(found).toHaveLength(3);
    });
  });

  describe('Hidden back button (spacer)', () => {
    it('renders at least one <button> element', () => {
      expect(container.querySelectorAll('button').length).toBeGreaterThanOrEqual(1);
    });

    it('renders the ArrowBack icon', () => {
      expect(screen.getByTestId('ArrowBackIcon')).toBeInTheDocument();
    });

    it('button contains the text "Back"', () => {
      expect(getByTextContent(container, /back/i)).toBeTruthy();
    });
  });

  describe('Badge text integrity', () => {
    it('badge contains both "Secure" and "Authentication"', () => {
      const badge = getByTextContent(container, /secure/i);
      expect(badge.textContent).toMatch(/secure/i);
      expect(badge.textContent).toMatch(/authentication/i);
    });

    it('badge contains the "·" separator', () => {
      const badge = getByTextContent(container, /·/);
      expect(badge.textContent).toContain('·');
    });
  });

  describe('Sub-copy content', () => {
    it('mentions "rule sets"', () => {
      expect(getByTextContent(container, /rule sets/i)).toBeTruthy();
    });

    it('mentions collaborating with the team', () => {
      expect(getByTextContent(container, /collaborate with your team/i)).toBeTruthy();
    });

    it('mentions business logic', () => {
      expect(getByTextContent(container, /business logic/i)).toBeTruthy();
    });
  });

  describe('Headline content', () => {
    it('headline contains "Welcome"', () => {
      const el = getByTextContent(container, /welcome/i);
      expect(el.textContent?.toLowerCase()).toContain('welcome');
    });

    it('headline contains "back"', () => {
      const el = getByTextContent(container, /welcome/i);
      expect(el.textContent?.toLowerCase()).toContain('back');
    });
  });
});