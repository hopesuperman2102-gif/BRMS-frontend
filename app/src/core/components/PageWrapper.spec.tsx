import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PageWrapper from './PageWrapper';

const defaultProps = {
  children: <div>content</div>,
};

function renderPageWrapper(
  props: Partial<React.ComponentProps<typeof PageWrapper>> = {}
) {
  return render(<PageWrapper {...defaultProps} {...props} />);
}

describe('PageWrapper', () => {
  describe('Rendering', () => {
    it('renders children', () => {
      renderPageWrapper({
        children: <span>Hello</span>,
      });
      expect(screen.getByText('Hello')).toBeInTheDocument();
    });

    it('renders multiple children', () => {
      renderPageWrapper({
        children: (
          <>
            <span>Child One</span>
            <span>Child Two</span>
          </>
        ),
      });
      expect(screen.getByText('Child One')).toBeInTheDocument();
      expect(screen.getByText('Child Two')).toBeInTheDocument();
    });

    it('renders with fixed=false by default', () => {
      const { container } = renderPageWrapper();
      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders with fixed=true', () => {
      const { container } = renderPageWrapper({
        fixed: true,
        children: <div>fixed content</div>,
      });
      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders with fixed=false explicitly', () => {
      const { container } = renderPageWrapper({
        fixed: false,
        children: <div>scrollable content</div>,
      });
      expect(container.firstChild).toBeInTheDocument();
    });
  });
});
