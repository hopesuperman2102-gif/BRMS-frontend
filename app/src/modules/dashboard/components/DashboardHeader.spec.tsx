import { ReactNode } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DashboardHeader from '@/modules/dashboard/components/DashboardHeader';

// Mock react-router-dom hooks
const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  useLocation: () => ({
    state: { verticalName: 'Retail Banking' },
  }),
  useNavigate: () => mockNavigate,
  useParams: () => ({
    vertical_Key: 'retail',
  }),
}));

// Mock RcCard (since it is a custom component)
vi.mock('@/core/components/RcCard', () => ({
  RcCard: ({ children }: { children: ReactNode }) => (
  <div data-testid="rc-card">{children}</div>
),
}));

describe('DashboardHeader', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders dashboard title and subtitle', () => {
    render(<DashboardHeader />);

    expect(screen.getByText('BRMS Dashboard')).toBeInTheDocument();

    expect(
      screen.getByText(
        'Real-time insights into your business rules performance and health'
      )
    ).toBeInTheDocument();
  });

  it('renders Hub button', () => {
    render(<DashboardHeader />);

    expect(screen.getByRole('button', { name: 'Hub' })).toBeInTheDocument();
  });

  it('navigates to hub when Hub button is clicked', () => {
    render(<DashboardHeader />);

    const hubButton = screen.getByRole('button', { name: 'Hub' });
    fireEvent.click(hubButton);

    expect(mockNavigate).toHaveBeenCalledWith(
      '/vertical/retail/dashboard/hub',
      {
        state: { verticalName: 'Retail Banking' },
      }
    );
  });
});