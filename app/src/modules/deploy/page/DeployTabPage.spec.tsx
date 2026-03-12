import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import DeployTabPage from './DeployTabPage';

vi.mock('@/modules/deploy/components/DeployTabComponent', () => ({
  __esModule: true,
  default: () => <div data-testid="deploy-tab-component">Deploy Tab Component</div>,
}));

describe('DeployTabPage', () => {
  it('renders DeployTabComponent', () => {
    render(<DeployTabPage />);
    expect(screen.getByTestId('deploy-tab-component')).toBeInTheDocument();
  });
});
