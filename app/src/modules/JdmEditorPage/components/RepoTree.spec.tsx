import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RepoTree from './RepoTree';
import type { RepoTreeProps, RepoItem } from '../types/JdmEditorTypes';

const mockItems: RepoItem[] = [
  {
    id: 'folder-1',
    name: 'Folder 1',
    type: 'folder' as const,
    children: [
      {
        id: 'file-1',
        name: 'File 1',
        type: 'file' as const,
      },
    ],
  },
  {
    id: 'file-2',
    name: 'File 2',
    type: 'file' as const,
  },
];

describe('RepoTree', () => {
  let defaultProps: RepoTreeProps;

  beforeEach(() => {
    defaultProps = {
      items: mockItems,
      selectedId: 'file-2',
      expandedFolders: new Set(['folder-1']),
      onToggleFolder: vi.fn(),
      onSelectItem: vi.fn(),
      onDragStart: vi.fn(),
      onDropOnFolder: vi.fn(),
    };
  });

  it('renders all items correctly', () => {
    render(<RepoTree {...defaultProps} />);

    expect(screen.getByText('Folder 1')).toBeInTheDocument();
    expect(screen.getByText('File 1')).toBeInTheDocument();
    expect(screen.getByText('File 2')).toBeInTheDocument();
  });

  it('handles folder click (toggle + select)', () => {
    render(<RepoTree {...defaultProps} />);

    fireEvent.click(screen.getByText('Folder 1'));

    expect(defaultProps.onToggleFolder).toHaveBeenCalledWith('folder-1');
    expect(defaultProps.onSelectItem).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'folder-1' })
    );
  });

  it('handles file click (select only)', () => {
    render(<RepoTree {...defaultProps} />);

    fireEvent.click(screen.getByText('File 2'));

    expect(defaultProps.onToggleFolder).not.toHaveBeenCalled();
    expect(defaultProps.onSelectItem).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'file-2' })
    );
  });

  it('does not render children when folder is collapsed', () => {
    defaultProps.expandedFolders = new Set(); // nothing expanded

    render(<RepoTree {...defaultProps} />);

    expect(screen.queryByText('File 1')).not.toBeInTheDocument();
  });

  it('handles drag start', () => {
    render(<RepoTree {...defaultProps} />);

    const file = screen.getByText('File 2');
    fireEvent.dragStart(file);

    expect(defaultProps.onDragStart).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'file-2' })
    );
  });

  it('handles drop on folder', () => {
    render(<RepoTree {...defaultProps} />);

    const folder = screen.getByText('Folder 1');

    fireEvent.drop(folder, {
      preventDefault: vi.fn(),
    });

    expect(defaultProps.onDropOnFolder).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'folder-1' })
    );
  });

  it("prevents default on drag over for folders", () => {
  const preventDefault = vi.fn();

  const { getByText } = render(
    <RepoTree {...defaultProps} />
  );

  const folder = getByText("Folder 1");

  const event = new Event("dragover", { bubbles: true });
  Object.assign(event, { preventDefault });

  folder.dispatchEvent(event);

  expect(preventDefault).toHaveBeenCalled();
});

  it("does not prevent default on drag over for files", () => {
  const preventDefault = vi.fn();

  const { getByText } = render(<RepoTree {...defaultProps} />);

  const file = getByText("File 1");

  const event = new Event("dragover", { bubbles: true });
  Object.assign(event, { preventDefault });

  file.dispatchEvent(event);

  expect(preventDefault).not.toHaveBeenCalled();
});

  it('renders nested RepoTree recursively', () => {
    render(<RepoTree {...defaultProps} />);

    // child file proves recursion worked
    expect(screen.getByText('File 1')).toBeInTheDocument();
  });
});