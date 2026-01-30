'use client';

import { Box } from '@mui/material';
import { RepoItem } from '../../../core/types/commonTypes';
import ProjectTabs from '../../../core/components/ProjectTabs';
import { EditorProps } from '../types/JdmEditorTypes';
import EnhancedJdmEditor from '../../../core/components/EnhancedJdmEditor';

export default function Editor({
  items,
  selectedId,
  openFiles,
  setOpenFiles,
}: EditorProps) {
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

  const handleSelectFile = (id: number) => {
    // This is just for tab switching, selection is handled by RepositoryPanel
  };

  const handleCloseFile = (id: number) => {
    setOpenFiles((prev) => prev.filter((x) => x !== id));
  };

  const handleGraphChange = (value: any) => {
    // Update the graph in your items state
    // You'll need to implement this based on your state management
    console.log('Graph changed:', value);
  };

  const handleFileNameChange = (name: string) => {
    // Update the file name in your items state
    // You'll need to implement this based on your state management
    console.log('File name changed:', name);
  };

  const openedFiles = openFiles.map((id) => findItem(items, id)).filter(Boolean) as RepoItem[];
  const selectedItem = selectedId ? findItem(items, selectedId) : null;

  return (
    <Box
      sx={{
        flex: 1,
        p: 1.5,
        minWidth: 0,
        overflow: 'hidden',
      }}
    >
      {/* Main container with border radius and overflow hidden */}
      <Box
        sx={{
          height: '100%',
          bgcolor: '#fff',
          borderRadius: 2,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
      >
        {/* Tabs container with constrained width */}
        <Box
          sx={{
            minWidth: 0,
            width: '100%',
            flexShrink: 0,
          }}
        >
          <ProjectTabs
            projects={openedFiles}
            activeProjectId={selectedId}
            onSelect={handleSelectFile}
            onClose={handleCloseFile}
          />
        </Box>

        {selectedId && selectedItem?.type === 'file' && (
          <Box sx={{ flex: 1, overflow: 'hidden' }}>
            <EnhancedJdmEditor
              value={selectedItem?.graph}
              onChange={handleGraphChange}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}