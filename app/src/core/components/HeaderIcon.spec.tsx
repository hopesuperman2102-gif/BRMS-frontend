import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import HeaderIcon from './HeaderIcon';

describe('HeaderIcon', () => {
  it('renders the icon button with the tooltip text', () => {
    render(
      <HeaderIcon
        icon={<span data-testid="header-icon">Icon</span>}
        tooltip="Open settings"
        onClick={vi.fn()}
      />
    );

    expect(screen.getByTestId('header-icon')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('calls the click handler when pressed', () => {
    const onClick = vi.fn();

    render(
      <HeaderIcon
        icon={<span>Icon</span>}
        tooltip="Open settings"
        onClick={onClick}
      />
    );

    fireEvent.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
