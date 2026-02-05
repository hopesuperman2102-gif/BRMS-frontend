'use client';

import { Box } from '@mui/material';
import { RepoItem } from '../../../core/types/commonTypes';
import { EditorProps } from '../types/JdmEditorTypes';
import JdmEditorComponent from '../../../core/components/JdmEditorComponent';

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

  const handleCloseFile = (id: number) => {
    setOpenFiles((prev) => prev.filter((x) => x !== id));
  };

  const handleGraphChange = (value: any) => {
    console.log('Graph changed:', value);
  };

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
        <Box
          sx={{
            minWidth: 0,
            width: '100%',
            flexShrink: 0,
          }}
        >
        </Box>

        {selectedId && selectedItem?.type === 'file' && (
          <Box sx={{ flex: 1, overflow: 'hidden' }}>
            <JdmEditorComponent
              value={selectedItem?.graph}
              onChange={handleGraphChange}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}