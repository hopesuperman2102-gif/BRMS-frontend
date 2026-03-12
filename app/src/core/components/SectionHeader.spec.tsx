import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SectionHeader from './SectionHeader';

const defaultProps = {
  left: <span>Left Content</span>,
  right: <button type="button">Right Action</button>,
};

function renderSectionHeader(
  props: Partial<React.ComponentProps<typeof SectionHeader>> = {}
) {
  return render(<SectionHeader {...defaultProps} {...props} />);
}

describe('SectionHeader', () => {
  describe('Rendering', () => {
    it('renders left content', () => {
      renderSectionHeader();
      expect(screen.getByText('Left Content')).toBeInTheDocument();
    });

    it('renders right content', () => {
      renderSectionHeader();
      expect(screen.getByRole('button', { name: 'Right Action' })).toBeInTheDocument();
    });

    it('renders custom nodes on both sides', () => {
      renderSectionHeader({
        left: <h2>Title</h2>,
        right: <span>Status</span>,
      });
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
    });
  });
});
