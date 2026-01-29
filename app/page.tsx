'use client';

import { useState } from 'react';
import { Box } from '@mui/material';
import { RepoItem } from './src/components/types';
import RepositorySidebar from './src/components/RepositorySidebar';
import ProjectTabs from './src/components/ProjectTabs';
import JdmEditor from './src/components/JdmEditor';
import AddMenu from './src/components/AddMenu';
import CreateItemDialog from './src/components/CreateItemDialog';
import MoveConfirmDialog from './src/components/Moveconfirmdialog';
import alertUtils from './src/components/AlertUtils';
import AlertComponent from './src/components/Alert';

export default function Page() {
  const [items, setItems] = useState<RepoItem[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [openFiles, setOpenFiles] = useState<number[]>([]);
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
    // If nothing is selected, create at root
    if (!selectedId) return null;

    const selected = findItem(items, selectedId);
    if (!selected) return null;

    // If selected item is a FOLDER → create INSIDE it
    if (selected.type === 'folder') return selected;

    // If selected item is a FILE → create at SAME LEVEL (find parent folder)
    return findParentFolder(items, selected.id);
  };

  const openFile = (id: number) => {
    setSelectedId(id);
    setOpenFiles((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const addItem = () => {
    if (!createType || !name.trim()) return;

    const destination = resolveDestination();
    
    // Check if name already exists in the destination
    const checkDuplicate = (list: RepoItem[]): boolean => {
      return list.some((item) => item.name.toLowerCase() === name.trim().toLowerCase());
    };

    let isDuplicate = false;
    if (!destination) {
      // Check at root level
      isDuplicate = checkDuplicate(items);
    } else {
      // Check in destination folder
      isDuplicate = checkDuplicate(destination.children || []);
    }

    if (isDuplicate) {
      alertUtils.warning(`A ${createType} with the name "${name.trim()}" already exists in this location.`);
      return;
    }

    const newItem: RepoItem = {
      id: Date.now(),
      name: name.trim(),
      type: createType,
      ...(createType === 'file' ? { graph: {} } : { children: [] }),
    };

    setItems((prev) => {
      // Add at root level if no destination
      if (!destination) {
        return [...prev, newItem];
      }

      // Expand the destination folder
      setExpandedFolders((p) => new Set(p).add(destination.id));

      // Insert into the destination folder
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

    // Open the file if it's a file
    if (createType === 'file') {
      openFile(newItem.id);
    } else {
      // Select the newly created folder (VS Code behavior)
      setSelectedId(newItem.id);
    }

    // Reset dialog state
    setCreateType(null);
    setName('');
  };

  const handleDragStart = (item: RepoItem) => {
    setDraggedItem(item);
  };

  const handleDropOnFolder = (targetFolder: RepoItem) => {
    if (!draggedItem) return;
    
    // Don't allow dropping on itself
    if (draggedItem.id === targetFolder.id) return;
    
    // Check if item is already in the target folder
    const currentParent = findParentFolder(items, draggedItem.id);
    if (currentParent?.id === targetFolder.id) {
      alertUtils.info(`"${draggedItem.name}" is already in "${targetFolder.name}".`);
      setDraggedItem(null);
      return;
    }
    
    // Check if root level item is being dropped at root (no parent means it's at root)
    if (!currentParent && targetFolder.id === -1) {
      alertUtils.info(`"${draggedItem.name}" is already at the root level.`);
      setDraggedItem(null);
      return;
    }
    
    // Check if name already exists in target folder
    const nameExists = targetFolder.children?.some(
      (child) => child.name.toLowerCase() === draggedItem.name.toLowerCase()
    );
    
    if (nameExists) {
      alertUtils.warning(`A ${draggedItem.type} with the name "${draggedItem.name}" already exists in "${targetFolder.name}".`);
      setDraggedItem(null);
      return;
    }
    
    // Don't allow dropping a folder into its own child
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
      // Remove item from current location
      let updatedItems = removeItem(prev, draggedItem.id);

      // Add item to new location
      const insert = (list: RepoItem[]): RepoItem[] =>
        list.map((i) =>
          i.id === dropTarget.id
            ? { ...i, children: [...(i.children || []), draggedItem] }
            : i.children
            ? { ...i, children: insert(i.children) }
            : i
        );

      updatedItems = insert(updatedItems);

      // Expand the target folder
      setExpandedFolders((p) => new Set(p).add(dropTarget.id));

      return updatedItems;
    });

    // Show success message
    alertUtils.success(`Moved "${draggedItem.name}" to "${dropTarget.name}"`);

    // Reset drag state
    setDraggedItem(null);
    setDropTarget(null);
    setShowMoveConfirm(false);
  };

  const cancelMove = () => {
    setDraggedItem(null);
    setDropTarget(null);
    setShowMoveConfirm(false);
  };

  const openedFiles = openFiles.map((id) => findItem(items, id)).filter(Boolean) as RepoItem[];

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#e5e9f7', overflow: 'hidden' }}>
      <RepositorySidebar
        items={items}
        selectedId={selectedId}
        expandedFolders={expandedFolders}
        onToggleFolder={toggleFolder}
        onSelectItem={(item) => {
          setSelectedId(item.id);
          if (item.type === 'file') openFile(item.id);
        }}
        onAddClick={setAnchorEl}
        onDragStart={handleDragStart}
        onDropOnFolder={handleDropOnFolder}
      />

      <Box sx={{ 
        flex: 1, 
        p: 1.5,
        minWidth: 0, // CRITICAL: Allows flex child to shrink below content size
        overflow: 'hidden', // Prevents this container from scrolling
      }}>
        {/* Main container with border radius and overflow hidden */}
        <Box 
          sx={{ 
            height: '100%', 
            bgcolor: '#fff', 
            borderRadius: 2,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0, // CRITICAL: Allows flex child to shrink
          }}
        >
          {/* Tabs container with constrained width */}
          <Box sx={{ 
            minWidth: 0, // CRITICAL: Constrains tabs to container width
            width: '100%', // Takes full width of parent
            flexShrink: 0,
          }}>
            <ProjectTabs
              projects={openedFiles}
              activeProjectId={selectedId}
              onSelect={openFile}
              onClose={(id) => setOpenFiles((prev) => prev.filter((x) => x !== id))}
            />
          </Box>

          {selectedId && findItem(items, selectedId)?.type === 'file' && (
            <Box sx={{ flex: 1, overflow: 'hidden' }}>
              <JdmEditor value={findItem(items, selectedId)?.graph} onChange={() => {}} />
            </Box>
          )}
        </Box>
      </Box>

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

      {/* Move Confirmation Dialog */}
      <MoveConfirmDialog
        open={showMoveConfirm}
        itemName={draggedItem?.name || ''}
        targetName={dropTarget?.name || ''}
        onClose={cancelMove}
        onConfirm={confirmMove}
      />

      {/* Alert Component */}
      <AlertComponent />
    </Box>
  );
}