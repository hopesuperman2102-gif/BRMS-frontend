import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import HeaderIcon from './HeaderIcon';

const defaultProps = {
  icon: <span data-testid="header-icon">Icon</span>,
  tooltip: 'Open settings',
  onClick: vi.fn(),
};

function renderHeaderIcon(
  props: Partial<React.ComponentProps<typeof HeaderIcon>> = {}
) {
  return render(<HeaderIcon {...defaultProps} {...props} />);
}

describe('HeaderIcon', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('Rendering', () => {
    it('renders the icon button with the tooltip text', () => {
      renderHeaderIcon();

      expect(screen.getByTestId('header-icon')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('renders custom icon content', () => {
      renderHeaderIcon({
        icon: <span data-testid="custom-icon">Custom</span>,
      });

      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('calls the click handler when pressed', () => {
      const onClick = vi.fn();

      renderHeaderIcon({ onClick });
      fireEvent.click(screen.getByRole('button'));

      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });
});
