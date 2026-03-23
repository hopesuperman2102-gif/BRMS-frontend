import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import RulesRightPanel from './RulesRightPanel';

const folderCardMock = vi.fn(({ item, onOpen }: Record<string, unknown>) => (
  <button onClick={onOpen as () => void}>Folder:{(item as { name: string }).name}</button>
));

const fileCardMock = vi.fn(({ item, onOpen, onMouseEnter, onMouseLeave }: Record<string, unknown>) => (
  <div>
    <button onClick={onOpen as () => void}>File:{(item as { name: string }).name}</button>
    <button onMouseEnter={onMouseEnter as () => void} onMouseLeave={onMouseLeave as () => void}>Hover file</button>
  </div>
));

vi.mock('@/modules/rules/components/FolderCard', () => ({
  FolderCard: (props: Record<string, unknown>) => folderCardMock(props),
}));

vi.mock('@/modules/rules/components/FileCard', () => ({
  FileCard: (props: Record<string, unknown>) => fileCardMock(props),
}));

function renderPanel(isReviewer = false) {
  const onOpenFolder = vi.fn();
  const onOpenFile = vi.fn();
  const onCreateNewRule = vi.fn();
  const onNavigateToBreadcrumb = vi.fn();

  render(
    <RulesRightPanel
      projectName="Fraud Rules"
      breadcrumbs={[
        { name: 'Home', path: '' },
        { name: 'Payments', path: 'payments' },
      ]}
      visibleItems={[
        { kind: 'folder', path: 'payments/checks', name: 'Checks' },
        { kind: 'file', rule_key: 'rule-1', name: 'Velocity Rule' },
      ] as never}
      editingFolderId={null}
      editingFolderName=""
      newMenuAnchor={document.createElement('button')}
      anchorEl={document.createElement('button')}
      onBack={vi.fn()}
      onNewMenuOpen={vi.fn()}
      onNewMenuClose={vi.fn()}
      onCreateNewRule={onCreateNewRule}
      onCreateNewFolder={vi.fn()}
      onNavigateToBreadcrumb={onNavigateToBreadcrumb}
      onOpenFolder={onOpenFolder}
      onOpenFile={onOpenFile}
      onMenuOpen={vi.fn()}
      onMenuClose={vi.fn()}
      onEdit={vi.fn()}
      onDelete={vi.fn()}
      onNameChange={vi.fn()}
      onNameBlur={vi.fn()}
      onNameKeyDown={vi.fn()}
      onMouseEnterFile={vi.fn()}
      onMouseLeaveFile={vi.fn()}
      isReviewer={isReviewer}
    />
  );

  return { onOpenFolder, onOpenFile, onCreateNewRule, onNavigateToBreadcrumb };
}

describe('RulesRightPanel', () => {
  it('renders the breadcrumb trail and item cards', () => {
    const { onOpenFolder, onOpenFile, onNavigateToBreadcrumb } = renderPanel();

    expect(screen.getByText('All Rules')).toBeInTheDocument();
    expect(screen.getByText('Browse and manage rules for Fraud Rules')).toBeInTheDocument();
    expect(screen.getByText('2 items')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Folder:Checks'));
    fireEvent.click(screen.getByText('File:Velocity Rule'));
    fireEvent.click(screen.getByText('Home').closest('button') as HTMLButtonElement);

    expect(onOpenFolder).toHaveBeenCalledTimes(1);
    expect(onOpenFile).toHaveBeenCalledTimes(1);
    expect(onNavigateToBreadcrumb).toHaveBeenCalledWith({ name: 'Home', path: '' });
  },10000);

  it('shows the empty state when there are no visible items', () => {
    render(
      <RulesRightPanel
        projectName="Fraud Rules"
        breadcrumbs={[{ name: 'Home', path: '' }]}
        visibleItems={[] as never}
        editingFolderId={null}
        editingFolderName=""
        newMenuAnchor={null}
        anchorEl={null}
        onBack={vi.fn()}
        onNewMenuOpen={vi.fn()}
        onNewMenuClose={vi.fn()}
        onCreateNewRule={vi.fn()}
        onCreateNewFolder={vi.fn()}
        onNavigateToBreadcrumb={vi.fn()}
        onOpenFolder={vi.fn()}
        onOpenFile={vi.fn()}
        onMenuOpen={vi.fn()}
        onMenuClose={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onNameChange={vi.fn()}
        onNameBlur={vi.fn()}
        onNameKeyDown={vi.fn()}
        onMouseEnterFile={vi.fn()}
        onMouseLeaveFile={vi.fn()}
      />
    );

    expect(screen.getByText('This folder is empty')).toBeInTheDocument();
    expect(screen.getByText('Create a new rule or folder to get started')).toBeInTheDocument();
  });

  it('hides creation controls for reviewers', () => {
    renderPanel(true);

    expect(screen.queryByRole('button', { name: /new/i })).not.toBeInTheDocument();
    expect(screen.queryByText('Rename')).not.toBeInTheDocument();
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });
});
