import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PageWrapper from './PageWrapper';

describe('PageWrapper', () => {
  it('renders children', () => {
    render(
      <PageWrapper>
        <span>Hello</span>
      </PageWrapper>
    );
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('renders multiple children', () => {
    render(
      <PageWrapper>
        <span>Child One</span>
        <span>Child Two</span>
      </PageWrapper>
    );
    expect(screen.getByText('Child One')).toBeInTheDocument();
    expect(screen.getByText('Child Two')).toBeInTheDocument();
  });

  it('renders with fixed=false by default', () => {
    const { container } = render(
      <PageWrapper>
        <div>content</div>
      </PageWrapper>
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders with fixed=true', () => {
    const { container } = render(
      <PageWrapper fixed={true}>
        <div>fixed content</div>
      </PageWrapper>
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders with fixed=false explicitly', () => {
    const { container } = render(
      <PageWrapper fixed={false}>
        <div>scrollable content</div>
      </PageWrapper>
    );
    expect(container.firstChild).toBeInTheDocument();
  });
});