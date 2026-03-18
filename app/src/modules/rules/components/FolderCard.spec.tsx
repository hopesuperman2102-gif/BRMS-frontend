import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import type { FolderCardProps } from '@/modules/rules/types/Explorertypes';

const omit = <T extends object, K extends keyof T>(obj: T, ...keys: K[]): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach((k) => delete result[k]);
  return result;
};

vi.mock('@/core/theme/brmsTheme', () => {

  const colorKeys = [
    'surfaceBase', 'lightBorder', 'lightTextLow', 'lightTextMid', 'lightTextHigh',
    'lightSurfaceHover', 'panelIndigo', 'panelIndigoMuted', 'statusDraftBg',
  ];
  const colors = Object.fromEntries(colorKeys.map((k) => [k, k]));
  return {
    brmsTheme: {
      colors,
      fonts: { mono: 'monospace', sans: 'Arial' },
    },
  };
});

vi.mock('@mui/icons-material/Folder', () => ({
  default: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="folder-icon" {...props} />
  ),
}));

vi.mock('@mui/icons-material/MoreVert', () => ({
  default: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="more-vert-icon" {...props} />
  ),
}));

vi.mock('@mui/material', () => ({
  Typography: ({
    children,
    ...props
  }: React.HTMLAttributes<HTMLSpanElement>) => (
    <span {...props}>{children}</span>
  ),
  IconButton: ({ children, onClick, className, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { className?: string; disableRipple?: boolean }) => (
    <button
      data-testid="menu-button"
      className={className}
      onClick={onClick}
      {...omit(rest, 'disableRipple')}
    >
      {children}
    </button>
  ),
  TextField: ({
    value,
    onChange,
    onBlur,
    onKeyDown,
    onClick,
    inputRef,
  }: {
    value: string;
    onChange: React.ChangeEventHandler<HTMLInputElement>;
    onBlur: () => void;
    onKeyDown: React.KeyboardEventHandler;
    onClick: React.MouseEventHandler;
    inputRef?: React.Ref<HTMLInputElement>;
  }) => (
    <input
      data-testid="folder-name-input"
      ref={inputRef}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      onClick={onClick}
    />
  ),
}));

vi.mock('@mui/material/styles', () => ({
  styled:
    (Component: React.ElementType) =>
    (stylesFn?: ((props: Record<string, unknown>) => object) | object) => {

      if (typeof stylesFn === 'function') {
        stylesFn({ isediting: 'true' });
        stylesFn({ isediting: 'false' });
      }
      const Styled = ({ children, ...rest }: React.HTMLAttributes<HTMLElement> & { isediting?: string }) =>
        React.createElement(Component, omit(rest, 'isediting'), children);
      Styled.displayName = `Styled(${
        typeof Component === 'string'
          ? Component
          : (Component as React.FC).displayName ??
            (Component as React.FC).name ??
            'Component'
      })`;
      return Styled;
    },
}));

import { FolderCard } from './FolderCard';

const baseItem: FolderCardProps['item'] = {
  kind: 'folder',
  name: 'Finance Rules',
  path: 'finance/rules',
  parentPath: 'finance',
};

const defaultProps: FolderCardProps = {
  item: baseItem,
  isEditing: false,
  editingFolderName: '',
  onOpen: vi.fn(),
  onMenuOpen: vi.fn(),
  onNameChange: vi.fn(),
  onNameBlur: vi.fn(),
  onNameKeyDown: vi.fn(),
};

const renderCard = (props: Partial<FolderCardProps & { isReviewer?: boolean }> = {}) =>
  render(<FolderCard {...defaultProps} {...props} />);

describe('FolderCard', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('view mode rendering', () => {
    it('renders the folder name', () => {
      renderCard();
      expect(screen.getByText('Finance Rules')).toBeTruthy();
    });

    it('renders the folder icon', () => {
      renderCard();
      expect(screen.getByTestId('folder-icon')).toBeTruthy();
    });

    it('renders the menu button when not editing and not a reviewer', () => {
      renderCard();
      expect(screen.getByTestId('menu-button')).toBeTruthy();
    });

    it('renders the MoreVert icon when not editing and not a reviewer', () => {
      renderCard();
      expect(screen.getByTestId('more-vert-icon')).toBeTruthy();
    });

    it('does not render the name input in view mode', () => {
      renderCard();
      expect(screen.queryByTestId('folder-name-input')).toBeNull();
    });
  });

  describe('isReviewer prop', () => {
    it('hides the menu button when isReviewer=true', () => {
      renderCard({ isReviewer: true });
      expect(screen.queryByTestId('menu-button')).toBeNull();
    });

    it('hides the MoreVert icon when isReviewer=true', () => {
      renderCard({ isReviewer: true });
      expect(screen.queryByTestId('more-vert-icon')).toBeNull();
    });

    it('shows the menu button when isReviewer=false', () => {
      renderCard({ isReviewer: false });
      expect(screen.getByTestId('menu-button')).toBeTruthy();
    });

    it('shows the menu button when isReviewer is omitted (defaults to false)', () => {
      renderCard();
      expect(screen.getByTestId('menu-button')).toBeTruthy();
    });
  });

  describe('edit mode rendering', () => {
    it('renders the name input when isEditing=true', () => {
      renderCard({ isEditing: true, editingFolderName: 'New Folder' });
      expect(screen.getByTestId('folder-name-input')).toBeTruthy();
    });

    it('shows the current editingFolderName in the input', () => {
      renderCard({ isEditing: true, editingFolderName: 'My Folder' });
      const input = screen.getByTestId('folder-name-input') as HTMLInputElement;
      expect(input.value).toBe('My Folder');
    });

    it('does not render the folder name text when editing', () => {
      renderCard({ isEditing: true, editingFolderName: 'My Folder' });
      expect(screen.queryByText('Finance Rules')).toBeNull();
    });

    it('does not render the menu button when editing', () => {
      renderCard({ isEditing: true, editingFolderName: 'My Folder' });
      expect(screen.queryByTestId('menu-button')).toBeNull();
    });

    it('still renders the folder icon in edit mode', () => {
      renderCard({ isEditing: true, editingFolderName: 'My Folder' });
      expect(screen.getByTestId('folder-icon')).toBeTruthy();
    });
  });

  describe('onOpen', () => {
    it('calls onOpen when the card is clicked in view mode', () => {
      const onOpen = vi.fn();
      const { container } = render(<FolderCard {...defaultProps} onOpen={onOpen} />);
      fireEvent.click(container.firstElementChild!);
      expect(onOpen).toHaveBeenCalledTimes(1);
    });

    it('does not call onOpen when the card is clicked in edit mode', () => {
      const onOpen = vi.fn();
      const { container } = render(
        <FolderCard {...defaultProps} isEditing={true} editingFolderName="x" onOpen={onOpen} />
      );
      fireEvent.click(container.firstElementChild!);
      expect(onOpen).not.toHaveBeenCalled();
    });
  });

  describe('onMenuOpen', () => {
    it('calls onMenuOpen when the menu button is clicked', () => {
      const onMenuOpen = vi.fn();
      renderCard({ onMenuOpen });
      fireEvent.click(screen.getByTestId('menu-button'));
      expect(onMenuOpen).toHaveBeenCalledTimes(1);
    });

    it('stops propagation so onOpen is not called when menu button is clicked', () => {
      const onOpen = vi.fn();
      const onMenuOpen = vi.fn();
      renderCard({ onOpen, onMenuOpen });
      fireEvent.click(screen.getByTestId('menu-button'));
      expect(onOpen).not.toHaveBeenCalled();
    });

    it('passes the click event to onMenuOpen', () => {
      const onMenuOpen = vi.fn();
      renderCard({ onMenuOpen });
      fireEvent.click(screen.getByTestId('menu-button'));
      expect(onMenuOpen).toHaveBeenCalledWith(expect.any(Object));
    });
  });

  describe('FolderNameEditor callbacks', () => {
    it('calls onNameChange when the input value changes', () => {
      const onNameChange = vi.fn();
      renderCard({ isEditing: true, editingFolderName: 'Old', onNameChange });
      fireEvent.change(screen.getByTestId('folder-name-input'), {
        target: { value: 'New Name' },
      });
      expect(onNameChange).toHaveBeenCalledTimes(1);
    });

    it('calls onNameBlur when the input loses focus', () => {
      const onNameBlur = vi.fn();
      renderCard({ isEditing: true, editingFolderName: 'x', onNameBlur });
      fireEvent.blur(screen.getByTestId('folder-name-input'));
      expect(onNameBlur).toHaveBeenCalledTimes(1);
    });

    it('calls onNameKeyDown when a key is pressed in the input', () => {
      const onNameKeyDown = vi.fn();
      renderCard({ isEditing: true, editingFolderName: 'x', onNameKeyDown });
      fireEvent.keyDown(screen.getByTestId('folder-name-input'), { key: 'Enter' });
      expect(onNameKeyDown).toHaveBeenCalledTimes(1);
    });

    it('calls onNameKeyDown with Escape key', () => {
      const onNameKeyDown = vi.fn();
      renderCard({ isEditing: true, editingFolderName: 'x', onNameKeyDown });
      fireEvent.keyDown(screen.getByTestId('folder-name-input'), { key: 'Escape' });
      expect(onNameKeyDown).toHaveBeenCalledTimes(1);
    });

    it('stops propagation when the input is clicked (does not bubble to card)', () => {
      const onOpen = vi.fn();
      renderCard({ isEditing: true, editingFolderName: 'x', onOpen });
      fireEvent.click(screen.getByTestId('folder-name-input'));
      expect(onOpen).not.toHaveBeenCalled();
    });
  });

  describe('FolderNameEditor auto-focus', () => {
    it('focuses the input after mount via setTimeout', () => {
      vi.useFakeTimers();
      renderCard({ isEditing: true, editingFolderName: 'My Folder' });
      vi.runAllTimers();
      expect(document.activeElement).toBe(screen.getByTestId('folder-name-input'));
      vi.useRealTimers();
    });
  });

  describe('isediting styled prop coverage', () => {
    it('renders without error when isEditing=true (cursor:default branch)', () => {
      renderCard({ isEditing: true, editingFolderName: 'x' });
      expect(screen.getByTestId('folder-name-input')).toBeTruthy();
    });

    it('renders without error when isEditing=false (hover branch)', () => {
      renderCard({ isEditing: false });
      expect(screen.getByText('Finance Rules')).toBeTruthy();
    });
  });

  describe('item prop variations', () => {
    it('renders a different folder name', () => {
      renderCard({ item: { ...baseItem, name: 'Health Policies' } });
      expect(screen.getByText('Health Policies')).toBeTruthy();
    });

    it('renders a folder at a nested path', () => {
      const nested = { ...baseItem, name: 'Sub Rules', path: 'a/b/c', parentPath: 'a/b' };
      renderCard({ item: nested });
      expect(screen.getByText('Sub Rules')).toBeTruthy();
    });

    it('renders a temp folder (isTemp=true) without error', () => {
      renderCard({ item: { ...baseItem, name: 'New Folder', isTemp: true } });
      expect(screen.getByText('New Folder')).toBeTruthy();
    });
  });

  describe('prop type contract', () => {
    it('accepts all required props without type errors', () => {
      const props: FolderCardProps = { ...defaultProps };
      render(<FolderCard {...props} />);
      expect(screen.getByText('Finance Rules')).toBeTruthy();
    });

    it('accepts isEditing=true without type errors', () => {
      const props: FolderCardProps = {
        ...defaultProps,
        isEditing: true,
        editingFolderName: 'Editing',
      };
      render(<FolderCard {...props} />);
      expect(screen.getByTestId('folder-name-input')).toBeTruthy();
    });
  });
});