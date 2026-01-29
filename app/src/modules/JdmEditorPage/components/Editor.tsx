'use client';

import { Box } from '@mui/material';
import { RepoItem } from '../../../core/types/commonTypes';
import JdmEditor from '../../../core/components/JdmEditor';
import ProjectTabs from '../../../core/components/ProjectTabs';
import { EditorProps } from '../types/JdmEditorTypes';



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
    // Placeholder for graph changes
    // You can implement this later if needed
  };

  const openedFiles = openFiles.map((id) => findItem(items, id)).filter(Boolean) as RepoItem[];
  const selectedItem = selectedId ? findItem(items, selectedId) : null;

  return (
    <Box
      sx={{
        flex: 1,
        p: 1.5,
        minWidth: 0, // CRITICAL: Allows flex child to shrink below content size
        overflow: 'hidden', // Prevents this container from scrolling
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
          minWidth: 0, // CRITICAL: Allows flex child to shrink
        }}
      >
        {/* Tabs container with constrained width */}
        <Box
          sx={{
            minWidth: 0, // CRITICAL: Constrains tabs to container width
            width: '100%', // Takes full width of parent
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
            <JdmEditor value={selectedItem?.graph} onChange={handleGraphChange} />
          </Box>
        )}
      </Box>
    </Box>
  );
}