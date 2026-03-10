import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LogoTitle from './LogoTitle';

const defaultProps = {
  logo: null as React.ReactNode,
  organizationName: 'Cholamandalam',
};

function renderLogoTitle(
  props: Partial<React.ComponentProps<typeof LogoTitle>> = {}
) {
  return render(<LogoTitle {...defaultProps} {...props} />);
}

describe('LogoTitle', () => {
  describe('Rendering', () => {
    it('renders the organization name', () => {
      renderLogoTitle();
      expect(screen.getByText('Cholamandalam')).toBeInTheDocument();
    });

    it('renders the logo when provided as a React element', () => {
      renderLogoTitle({
        logo: <span role="img" aria-label="logo" data-testid="logo-img">L</span>,
        organizationName: 'Acme Corp',
      });
      expect(screen.getByTestId('logo-img')).toBeInTheDocument();
    });

    it('does not render a logo when logo is null', () => {
      renderLogoTitle({ logo: null });
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    it('does not render a logo when logo is undefined', () => {
      renderLogoTitle({
        logo: undefined,
        organizationName: 'My Org',
      });
      expect(screen.getByText('My Org')).toBeInTheDocument();
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    it('renders the organization name as an h6 variant', () => {
      renderLogoTitle({ organizationName: 'Test Org' });
      expect(screen.getByRole('heading', { level: 6 })).toHaveTextContent('Test Org');
    });

    it('renders logo and organization name together', () => {
      renderLogoTitle({
        logo: <span data-testid="custom-logo">Brand</span>,
        organizationName: 'FireCo',
      });
      expect(screen.getByTestId('custom-logo')).toBeInTheDocument();
      expect(screen.getByText('FireCo')).toBeInTheDocument();
    });

    it('renders with a long organization name', () => {
      const longName = 'A Very Long Organization Name That Goes On And On';
      renderLogoTitle({ organizationName: longName });
      expect(screen.getByText(longName)).toBeInTheDocument();
    });

    it('renders with an empty organization name', () => {
      const { container } = renderLogoTitle({ organizationName: '' });
      const heading = container.querySelector('h6');
      expect(heading).toBeInTheDocument();
      expect(heading?.textContent).toBe('');
    });

    it('renders logo as any valid React node', () => {
      renderLogoTitle({
        logo: <span>BrandMark</span>,
        organizationName: 'Corp',
      });
      expect(screen.getByText('BrandMark')).toBeInTheDocument();
    });
  });

  describe('Structure', () => {
    it('renders a styled h6 heading element', () => {
      renderLogoTitle({ organizationName: 'Styled Corp' });
      expect(screen.getByRole('heading', { level: 6 })).toBeInTheDocument();
    });
  });
});
