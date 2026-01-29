'use client';

import { useState } from 'react';
import { Box } from '@mui/material';
import { RepoItem } from './src/components/types';
import RepositorySidebar from './src/components/RepositorySidebar';
import ProjectTabs from './src/components/ProjectTabs';
import JdmEditor from './src/components/JdmEditor';
import AddMenu from './src/components/AddMenu';
import CreateItemDialog from './src/components/CreateItemDialog';

export default function Page() {
  const [items, setItems] = useState<RepoItem[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [openFiles, setOpenFiles] = useState<number[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set());

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [createType, setCreateType] = useState<'file' | 'folder' | null>(null);
  const [name, setName] = useState('');

  const toggleFolder = (id: number) => {
    setExpandedFolders(prev => {
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
      if (i.children?.some(c => c.id === childId)) return i;
      if (i.children) {
        const p = findParentFolder(i.children, childId);
        if (p) return p;
      }
    }
    return null;
  };

  const resolveDestination = (): RepoItem | null => {
    if (!selectedId) return null;
    const selected = findItem(items, selectedId);
    if (!selected) return null;
    if (selected.type === 'folder') return selected;
    return findParentFolder(items, selected.id);
  };

  const openFile = (id: number) => {
    setSelectedId(id);
    setOpenFiles(prev => prev.includes(id) ? prev : [...prev, id]);
  };

  const addItem = () => {
    if (!createType) return;

    const newItem: RepoItem = {
      id: Date.now(),
      name,
      type: createType,
      ...(createType === 'file' ? { graph: {} } : { children: [] }),
    };

    const destination = resolveDestination();

    setItems(prev => {
      if (!destination) return [...prev, newItem];

      setExpandedFolders(p => new Set(p).add(destination.id));

      const insert = (list: RepoItem[]): RepoItem[] =>
        list.map(i =>
          i.id === destination.id
            ? { ...i, children: [...(i.children || []), newItem] }
            : i.children ? { ...i, children: insert(i.children) } : i
        );

      return insert(prev);
    });

    if (createType === 'file') openFile(newItem.id);

    setCreateType(null);
    setName('');
  };

  const openedFiles = openFiles
    .map(id => findItem(items, id))
    .filter(Boolean) as RepoItem[];

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#e5e9f7' }}>
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
        onDragStart={() => {}}
        onDropOnFolder={() => {}}
      />

      <Box sx={{ flex: 1, p: 1.5 }}>
        <Box sx={{ height: '100%', bgcolor: '#fff', borderRadius: 2 }}>
          <ProjectTabs
            projects={openedFiles}
            activeProjectId={selectedId}
            onSelect={openFile}
            onClose={(id) => setOpenFiles(prev => prev.filter(x => x !== id))}
          />

          {selectedId && (
            <JdmEditor
              value={findItem(items, selectedId)?.graph}
              onChange={() => {}}
            />
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
        onClose={() => setCreateType(null)}
        onSubmit={addItem}
      />
    </Box>
  );
}
