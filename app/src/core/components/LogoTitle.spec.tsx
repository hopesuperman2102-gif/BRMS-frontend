import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LogoTitle from './LogoTitle';

describe('LogoTitle', () => {
  describe('Rendering', () => {
    it('renders the organization name', () => {
      render(<LogoTitle logo={null} organizationName="Acme Corp" />);
      expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    });

    it('renders the logo when provided as a React element', () => {
      const logo = <img src="/logo.svg" alt="logo" data-testid="logo-img" />;
      render(<LogoTitle logo={logo} organizationName="Acme Corp" />);
      expect(screen.getByTestId('logo-img')).toBeInTheDocument();
    });

    it('renders without a logo when logo is null', () => {
      render(<LogoTitle logo={null} organizationName="Acme Corp" />);
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    it('renders without a logo when logo is undefined', () => {
      render(<LogoTitle logo={undefined} organizationName="My Org" />);
      expect(screen.getByText('My Org')).toBeInTheDocument();
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    it('renders the organization name as an h6 variant', () => {
      render(<LogoTitle logo={null} organizationName="Test Org" />);
      const heading = screen.getByRole('heading', { level: 6 });
      expect(heading).toHaveTextContent('Test Org');
    });

    it('renders logo and organization name together', () => {
      const logo = <span data-testid="custom-logo">🔥</span>;
      render(<LogoTitle logo={logo} organizationName="FireCo" />);
      expect(screen.getByTestId('custom-logo')).toBeInTheDocument();
      expect(screen.getByText('FireCo')).toBeInTheDocument();
    });

    it('renders with a long organization name', () => {
      const longName = 'A Very Long Organization Name That Goes On And On';
      render(<LogoTitle logo={null} organizationName={longName} />);
      expect(screen.getByText(longName)).toBeInTheDocument();
    });

    it('renders with an empty organization name', () => {
      const { container } = render(<LogoTitle logo={null} organizationName="" />);
      const heading = container.querySelector('h6');
      expect(heading).toBeInTheDocument();
      expect(heading?.textContent).toBe('');
    });

    it('renders logo as any valid React node', () => {
      render(<LogoTitle logo={<span>BrandMark</span>} organizationName="Corp" />);
      expect(screen.getByText('BrandMark')).toBeInTheDocument();
    });
  });

  describe('StyledTypography styling', () => {
    it('renders styled h6 heading element', () => {
      render(<LogoTitle logo={null} organizationName="Styled Corp" />);
      expect(screen.getByRole('heading', { level: 6 })).toBeInTheDocument();
    });
  });
});