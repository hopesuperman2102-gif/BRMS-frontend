import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RcCard, CardHeader } from './RcCard';

vi.mock('framer-motion', () => ({
  motion: Object.assign(
    <T extends React.ElementType>(Component: T) => {
      type MockMotionProps = Record<string, unknown> & {
        children?: React.ReactNode;
      };
      const WrappedComponent = Component as React.ElementType;
      const MockMotionComponent = React.forwardRef<unknown, MockMotionProps>(({ children, ...rest }, ref) =>
        React.createElement(WrappedComponent, { ...rest, ref }, children as React.ReactNode)
      );
      MockMotionComponent.displayName = 'MockMotionComponent';
      return MockMotionComponent;
    },
    new Proxy(
      {},
      {
        get: (_target, prop) =>
          ({ children, ...rest }: React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }) => (
            <div data-motion={String(prop)} {...rest}>{children}</div>
          ),
      }
    )
  ),
  AnimatePresence: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));

describe('RcCard', () => {
  describe('Rendering', () => {
    it('renders children', () => {
      render(<RcCard><span>Card Content</span></RcCard>);
      expect(screen.getByText('Card Content')).toBeInTheDocument();
    });

    it('renders with animate=true by default', () => {
      render(<RcCard><div>Animated</div></RcCard>);
      expect(screen.getByText('Animated')).toBeInTheDocument();
    });

    it('renders with animate=false', () => {
      render(<RcCard animate={false}><div>Static</div></RcCard>);
      expect(screen.getByText('Static')).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      const { container } = render(
        <RcCard className="custom-class"><div>Content</div></RcCard>
      );
      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('renders with custom delay prop', () => {
      render(<RcCard delay={0.5}><div>Delayed</div></RcCard>);
      expect(screen.getByText('Delayed')).toBeInTheDocument();
    });

    it('renders with sx prop', () => {
      render(<RcCard sx={{ mt: 2 }}><div>Styled</div></RcCard>);
      expect(screen.getByText('Styled')).toBeInTheDocument();
    });
  });

  describe('onClick', () => {
    it('calls onClick when animate=true card is clicked', () => {
      const handleClick = vi.fn();
      render(<RcCard onClick={handleClick}><div>Click Me</div></RcCard>);
      fireEvent.click(screen.getByText('Click Me'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('calls onClick when animate=false card is clicked', () => {
      const handleClick = vi.fn();
      render(<RcCard animate={false} onClick={handleClick}><div>Click Me</div></RcCard>);
      fireEvent.click(screen.getByText('Click Me'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });
});

describe('CardHeader', () => {
  describe('Rendering', () => {
    it('renders the title', () => {
      render(<CardHeader title="My Title" />);
      expect(screen.getByText('My Title')).toBeInTheDocument();
    });

    it('renders subtitle when provided', () => {
      render(<CardHeader title="Title" subtitle="Sub text" />);
      expect(screen.getByText('Sub text')).toBeInTheDocument();
    });

    it('does not render subtitle when not provided', () => {
      render(<CardHeader title="Title Only" />);
      expect(screen.queryByText('Sub text')).not.toBeInTheDocument();
    });

    it('renders title as h6 heading', () => {
      render(<CardHeader title="Heading" />);
      expect(screen.getByRole('heading', { level: 6 })).toHaveTextContent('Heading');
    });

    it('does not render subtitle for empty string', () => {
      const { container } = render(<CardHeader title="Title" subtitle="" />);
      expect(container.querySelector('p')).toBeNull();
    });
  });
});
