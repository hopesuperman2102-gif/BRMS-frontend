import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import RepositorySidebar from '@/modules/JdmEditorPage/components/RepositorySidebar';
import type { RepoItem } from '@/modules/JdmEditorPage/types/JdmEditorTypes';

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('@/modules/JdmEditorPage/components/RepoTree', () => ({
  __esModule: true,
  default: ({
    items,
    selectedId,
    onToggleFolder,
    onSelectItem,
    onDragStart,
    onDropOnFolder,
  }: {
    items: RepoItem[];
    selectedId: string | number | null;
    expandedFolders: Set<string | number>;
    onToggleFolder: (id: string | number) => void;
    onSelectItem: (item: RepoItem) => void;
    onDragStart: (item: RepoItem) => void;
    onDropOnFolder: (folder: RepoItem) => void;
  }) => (
    <div data-testid="mock-repo-tree">
      <div>tree-count:{items.length}</div>
      <div>selected:{String(selectedId)}</div>
      <button type="button" onClick={() => onToggleFolder('folder-1')}>mock-toggle-folder</button>
      <button type="button" onClick={() => onSelectItem(items[0])}>mock-select-item</button>
      <button type="button" onClick={() => onDragStart(items[0])}>mock-drag-start</button>
      <button type="button" onClick={() => onDropOnFolder(items[0])}>mock-drop-on-folder</button>
    </div>
  ),
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const fileItem: RepoItem = { id: 'rule-1', name: 'My Rule', type: 'file' };
const folderItem: RepoItem = { id: 'folder-1', name: 'My Folder', type: 'folder', children: [fileItem] };

const onToggleFolder = vi.fn();
const onSelectItem = vi.fn();
const onAddClick = vi.fn();
const onDragStart = vi.fn();
const onDropOnFolder = vi.fn();
const onBackClick = vi.fn();

const defaultProps = {
  projectName: 'Test Project',
  items: [fileItem],
  selectedId: null as string | number | null,
  expandedFolders: new Set<string | number>(),
  onToggleFolder,
  onSelectItem,
  onAddClick,
  onDragStart,
  onDropOnFolder,
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('RepositorySidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Static content ──────────────────────────────────────────────────────────

  it('renders the "Repository Tree" heading', () => {
    render(<RepositorySidebar {...defaultProps} />);
    expect(screen.getByText('Repository Tree')).toBeInTheDocument();
  });

  it('renders the project name in the rules label bar', () => {
    render(<RepositorySidebar {...defaultProps} projectName="My BRMS Project" />);
    // jsdom does not apply CSS textTransform — the raw string is rendered
    expect(screen.getByText('My BRMS Project')).toBeInTheDocument();
  });

  it('renders different project names correctly', () => {
    render(<RepositorySidebar {...defaultProps} projectName="Another Project" />);
    expect(screen.getByText('Another Project')).toBeInTheDocument();
  });

  // ── Back button ─────────────────────────────────────────────────────────────

  it('renders back button when onBackClick is provided', () => {
    render(<RepositorySidebar {...defaultProps} onBackClick={onBackClick} />);
    // BackButton is an IconButton with only an SVG — no accessible text label.
    // The ArrowBackIcon SVG gets a data-testid from MUI in test env.
    expect(screen.getByTestId('ArrowBackIcon')).toBeInTheDocument();
  });

  it('does not render back button when onBackClick is not provided', () => {
    render(<RepositorySidebar {...defaultProps} />);
    expect(screen.queryByTestId('ArrowBackIcon')).not.toBeInTheDocument();
  });

  it('calls onBackClick when back button is clicked', () => {
    render(<RepositorySidebar {...defaultProps} onBackClick={onBackClick} />);
    // Click the icon button — it is the closest button ancestor of the ArrowBackIcon
    fireEvent.click(screen.getByTestId('ArrowBackIcon').closest('button')!);
    expect(onBackClick).toHaveBeenCalledTimes(1);
  });

  // ── RepoTree rendering ──────────────────────────────────────────────────────

  it('renders RepoTree when items are present', () => {
    render(<RepositorySidebar {...defaultProps} items={[fileItem]} />);
    expect(screen.getByTestId('mock-repo-tree')).toBeInTheDocument();
  });

  it('passes correct item count to RepoTree', () => {
    render(<RepositorySidebar {...defaultProps} items={[fileItem, folderItem]} />);
    expect(screen.getByText('tree-count:2')).toBeInTheDocument();
  });

  it('passes selectedId to RepoTree', () => {
    render(<RepositorySidebar {...defaultProps} selectedId="rule-1" />);
    expect(screen.getByText('selected:rule-1')).toBeInTheDocument();
  });

  it('passes null selectedId to RepoTree', () => {
    render(<RepositorySidebar {...defaultProps} selectedId={null} />);
    expect(screen.getByText('selected:null')).toBeInTheDocument();
  });

  // ── Empty state ─────────────────────────────────────────────────────────────

  it('renders empty state when items array is empty', () => {
    render(<RepositorySidebar {...defaultProps} items={[]} />);
    expect(screen.getByText('No rules found')).toBeInTheDocument();
    expect(screen.getByText('Create your first rule to get started')).toBeInTheDocument();
  });

  it('does not render RepoTree when items array is empty', () => {
    render(<RepositorySidebar {...defaultProps} items={[]} />);
    expect(screen.queryByTestId('mock-repo-tree')).not.toBeInTheDocument();
  });

  it('does not render empty state when items are present', () => {
    render(<RepositorySidebar {...defaultProps} items={[fileItem]} />);
    expect(screen.queryByText('No rules found')).not.toBeInTheDocument();
  });

  // ── RepoTree callbacks ──────────────────────────────────────────────────────

  it('calls onToggleFolder when RepoTree fires toggle', () => {
    render(<RepositorySidebar {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: 'mock-toggle-folder' }));
    expect(onToggleFolder).toHaveBeenCalledWith('folder-1');
  });

  it('calls onSelectItem when RepoTree fires select', () => {
    render(<RepositorySidebar {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: 'mock-select-item' }));
    expect(onSelectItem).toHaveBeenCalledWith(fileItem);
  });

  it('calls onDragStart when RepoTree fires drag start', () => {
    render(<RepositorySidebar {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: 'mock-drag-start' }));
    expect(onDragStart).toHaveBeenCalledWith(fileItem);
  });

  it('calls onDropOnFolder when RepoTree fires drop', () => {
    render(<RepositorySidebar {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: 'mock-drop-on-folder' }));
    expect(onDropOnFolder).toHaveBeenCalledWith(fileItem);
  });

  // ── expandedFolders passthrough ─────────────────────────────────────────────

  it('passes expandedFolders to RepoTree without crashing', () => {
    const expandedFolders = new Set<string | number>(['folder-1']);
    render(<RepositorySidebar {...defaultProps} expandedFolders={expandedFolders} />);
    expect(screen.getByTestId('mock-repo-tree')).toBeInTheDocument();
  });
});