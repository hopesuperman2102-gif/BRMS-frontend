'use client';

import { useState } from 'react';
import { Box } from '@mui/material';
import AlertComponent from '../../../core/components/Alert';
import { RepoItem } from '../../../core/types/commonTypes';
import ProjectTree from '../components/ProjectTree';
import Editor from '../components/Editor';

export default function JdmEditorWithSimulator() {
  // Shared state between panels
  const [items, setItems] = useState<RepoItem[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [openFiles, setOpenFiles] = useState<number[]>([]);

  // Open file handler
  const handleOpenFile = (id: number) => {
    setSelectedId(id);
    setOpenFiles((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        bgcolor: '#e5e9f7',
        overflow: 'hidden',
      }}
    >
      {/* Repository Panel */}
      <ProjectTree
        items={items}
        setItems={setItems}
        selectedId={selectedId}
        setSelectedId={setSelectedId}
        onOpenFile={handleOpenFile}
      />

      {/* Editor Panel */}
      <Editor
        items={items}
        selectedId={selectedId}
        openFiles={openFiles}
        setOpenFiles={setOpenFiles}
      />

      {/* Global Alert */}
      <AlertComponent />
    </Box>
  );
}
