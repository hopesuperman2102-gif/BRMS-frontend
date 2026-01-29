'use client';

import { useState } from 'react';
import { Box } from '@mui/material';
import { RepoItem } from '../../../core/types/commonTypes';
import alertUtils from '../../../core/components/AlertUtils';
import RepositorySidebar from '../../../core/components/RepositorySidebar';
import AddMenu from '../../../core/components/AddMenu';
import CreateItemDialog from '../../../core/components/CreateItemDialog';
import MoveConfirmDialog from '../../../core/components/Moveconfirmdialog';
import { ProjectTreeProps } from '../types/JdmEditorTypes';

export default function ProjectTree({
  items,
  setItems,
  selectedId,
  setSelectedId,
  onOpenFile,
}: ProjectTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set());
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [createType, setCreateType] = useState<'file' | 'folder' | null>(null);
  const [name, setName] = useState('');

  // Drag and drop state
  const [draggedItem, setDraggedItem] = useState<RepoItem | null>(null);
  const [dropTarget, setDropTarget] = useState<RepoItem | null>(null);
  const [showMoveConfirm, setShowMoveConfirm] = useState(false);

  const toggleFolder = (id: number) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const findItem = (list: RepoItem[], id: number): RepoItem | null => {
    for (const i of list) {
      if (i.id === id) return i;
      if (i.children) {
        const f = findItem(i.children, id);
        if (f) return f;
      }
    }
    return null;
  };

  const findParentFolder = (list: RepoItem[], childId: number): RepoItem | null => {
    for (const i of list) {
      if (i.children?.some((c) => c.id === childId)) return i;
      if (i.children) {
        const p = findParentFolder(i.children, childId);
        if (p) return p;
      }
    }
    return null;
  };

  const removeItem = (list: RepoItem[], itemId: number): RepoItem[] => {
    return list
      .filter((i) => i.id !== itemId)
      .map((i) => ({
        ...i,
        children: i.children ? removeItem(i.children, itemId) : undefined,
      }));
  };

  const resolveDestination = (): RepoItem | null => {
    if (!selectedId) return null;
    const selected = findItem(items, selectedId);
    if (!selected) return null;
    if (selected.type === 'folder') return selected;
    return findParentFolder(items, selected.id);
  };

  const addItem = () => {
    if (!createType || !name.trim()) return;

    const destination = resolveDestination();

    const checkDuplicate = (list: RepoItem[]): boolean => {
      return list.some((item) => item.name.toLowerCase() === name.trim().toLowerCase());
    };

    let isDuplicate = false;
    if (!destination) {
      isDuplicate = checkDuplicate(items);
    } else {
      isDuplicate = checkDuplicate(destination.children || []);
    }

    if (isDuplicate) {
      alertUtils.warning(
        `A ${createType} with the name "${name.trim()}" already exists in this location.`
      );
      return;
    }

    const newItem: RepoItem = {
      id: Date.now(),
      name: name.trim(),
      type: createType,
      ...(createType === 'file' ? { graph: {} } : { children: [] }),
    };

    setItems((prev) => {
      if (!destination) {
        return [...prev, newItem];
      }

      setExpandedFolders((p) => new Set(p).add(destination.id));

      const insert = (list: RepoItem[]): RepoItem[] =>
        list.map((i) =>
          i.id === destination.id
            ? { ...i, children: [...(i.children || []), newItem] }
            : i.children
            ? { ...i, children: insert(i.children) }
            : i
        );

      return insert(prev);
    });

    if (createType === 'file') {
      onOpenFile(newItem.id);
    } else {
      setSelectedId(newItem.id);
    }

    setCreateType(null);
    setName('');
  };

  const handleDragStart = (item: RepoItem) => {
    setDraggedItem(item);
  };

  const handleDropOnFolder = (targetFolder: RepoItem) => {
    if (!draggedItem) return;

    if (draggedItem.id === targetFolder.id) return;

    const currentParent = findParentFolder(items, draggedItem.id);
    if (currentParent?.id === targetFolder.id) {
      alertUtils.info(`"${draggedItem.name}" is already in "${targetFolder.name}".`);
      setDraggedItem(null);
      return;
    }

    if (!currentParent && targetFolder.id === -1) {
      alertUtils.info(`"${draggedItem.name}" is already at the root level.`);
      setDraggedItem(null);
      return;
    }

    const nameExists = targetFolder.children?.some(
      (child) => child.name.toLowerCase() === draggedItem.name.toLowerCase()
    );

    if (nameExists) {
      alertUtils.warning(
        `A ${draggedItem.type} with the name "${draggedItem.name}" already exists in "${targetFolder.name}".`
      );
      setDraggedItem(null);
      return;
    }

    if (draggedItem.type === 'folder') {
      const isDescendant = (parent: RepoItem, childId: number): boolean => {
        if (parent.id === childId) return true;
        if (!parent.children) return false;
        return parent.children.some((child) => isDescendant(child, childId));
      };

      if (isDescendant(draggedItem, targetFolder.id)) {
        setDraggedItem(null);
        return;
      }
    }

    setDropTarget(targetFolder);
    setShowMoveConfirm(true);
  };

  const confirmMove = () => {
    if (!draggedItem || !dropTarget) return;

    setItems((prev) => {
      let updatedItems = removeItem(prev, draggedItem.id);

      const insert = (list: RepoItem[]): RepoItem[] =>
        list.map((i) =>
          i.id === dropTarget.id
            ? { ...i, children: [...(i.children || []), draggedItem] }
            : i.children
            ? { ...i, children: insert(i.children) }
            : i
        );

      updatedItems = insert(updatedItems);
      setExpandedFolders((p) => new Set(p).add(dropTarget.id));

      return updatedItems;
    });

    alertUtils.success(`Moved "${draggedItem.name}" to "${dropTarget.name}"`);

    setDraggedItem(null);
    setDropTarget(null);
    setShowMoveConfirm(false);
  };

  const cancelMove = () => {
    setDraggedItem(null);
    setDropTarget(null);
    setShowMoveConfirm(false);
  };

  const handleSelectItem = (item: RepoItem) => {
    setSelectedId(item.id);
    if (item.type === 'file') onOpenFile(item.id);
  };

  return (
    <Box>
      <RepositorySidebar
        items={items}
        selectedId={selectedId}
        expandedFolders={expandedFolders}
        onToggleFolder={toggleFolder}
        onSelectItem={handleSelectItem}
        onAddClick={setAnchorEl}
        onDragStart={handleDragStart}
        onDropOnFolder={handleDropOnFolder}
      />

      <AddMenu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        onFile={() => setCreateType('file')}
        onFolder={() => setCreateType('folder')}
      />

      <CreateItemDialog
        open={!!createType}
        title={`Create ${createType}`}
        value={name}
        onChange={setName}
        onClose={() => {
          setCreateType(null);
          setName('');
        }}
        onSubmit={addItem}
      />

      <MoveConfirmDialog
        open={showMoveConfirm}
        itemName={draggedItem?.name || ''}
        targetName={dropTarget?.name || ''}
        onClose={cancelMove}
        onConfirm={confirmMove}
      />
    </Box>
  );
}