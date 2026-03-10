import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
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

const defaultCardProps = {
  children: <span>Card Content</span>,
};

function renderCard(
  props: Partial<React.ComponentProps<typeof RcCard>> = {}
) {
  return render(<RcCard {...defaultCardProps} {...props} />);
}

function renderCardHeader(
  props: Partial<React.ComponentProps<typeof CardHeader>> = {}
) {
  return render(<CardHeader title="My Title" {...props} />);
}

describe('RcCard', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('Rendering', () => {
    it('renders children', () => {
      renderCard();

      expect(screen.getByText('Card Content')).toBeInTheDocument();
    });

    it('renders with animate=true by default', () => {
      renderCard({
        children: <div>Animated</div>,
      });

      expect(screen.getByText('Animated')).toBeInTheDocument();
    });

    it('renders with animate=false', () => {
      renderCard({
        animate: false,
        children: <div>Static</div>,
      });

      expect(screen.getByText('Static')).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      const { container } = renderCard({
        className: 'custom-class',
        children: <div>Content</div>,
      });

      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('renders with custom delay prop', () => {
      renderCard({
        delay: 0.5,
        children: <div>Delayed</div>,
      });

      expect(screen.getByText('Delayed')).toBeInTheDocument();
    });

    it('renders with sx prop', () => {
      renderCard({
        sx: { mt: 2 },
        children: <div>Styled</div>,
      });

      expect(screen.getByText('Styled')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('calls onClick when animate=true card is clicked', () => {
      const onClick = vi.fn();

      renderCard({
        onClick,
        children: <div>Click Me</div>,
      });
      fireEvent.click(screen.getByText('Click Me'));

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('calls onClick when animate=false card is clicked', () => {
      const onClick = vi.fn();

      renderCard({
        animate: false,
        onClick,
        children: <div>Click Me</div>,
      });
      fireEvent.click(screen.getByText('Click Me'));

      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });
});

describe('CardHeader', () => {
  describe('Rendering', () => {
    it('renders the title', () => {
      renderCardHeader();

      expect(screen.getByText('My Title')).toBeInTheDocument();
    });

    it('renders subtitle when provided', () => {
      renderCardHeader({
        title: 'Title',
        subtitle: 'Sub text',
      });

      expect(screen.getByText('Sub text')).toBeInTheDocument();
    });

    it('does not render subtitle when not provided', () => {
      renderCardHeader({
        title: 'Title Only',
      });

      expect(screen.queryByText('Sub text')).not.toBeInTheDocument();
    });

    it('renders title as h6 heading', () => {
      renderCardHeader({
        title: 'Heading',
      });

      expect(screen.getByRole('heading', { level: 6 })).toHaveTextContent('Heading');
    });

    it('does not render subtitle for empty string', () => {
      const { container } = renderCardHeader({
        title: 'Title',
        subtitle: '',
      });

      expect(container.querySelector('p')).toBeNull();
    });
  });
});
