'use client';

import { useState } from 'react';
import { Box, Select, MenuItem, Button, FormControl, Typography } from '@mui/material';
import { RepoItem } from '../../../core/types/commonTypes';
import { EditorProps } from '../types/JdmEditorTypes';
import JdmEditorComponent from '../../../core/components/JdmEditorComponent';

export default function Editor({
  items,
  selectedId, }: EditorProps) {
  // Mock data for dropdown - will come from backend later
  const [selectedVersion, setSelectedVersion] = useState('v1.0.0');
  const mockVersions = ['v1.0.0', 'v1.0.1', 'v1.1.0', 'v2.0.0'];

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

  const handleGraphChange = (value: any) => {
    console.log('Graph changed:', value);
  };

  const handleCommit = () => {
    console.log('Committing changes for version:', selectedVersion);
    // Backend commit logic will go here
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
        {/* Top bar with file name (left) and dropdown + commit button (right) */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 2,
            py: 0.2,
            borderBottom: '1px solid #e5e7eb',
            flexShrink: 0,
          }}
        >
          {/* Left side - File name */}
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {selectedItem ? selectedItem.name : 'Select a file'}
          </Typography>

          {/* Right side - Dropdown and Commit button */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <Select
                value={selectedVersion}
                onChange={(e) => setSelectedVersion(e.target.value)}
                sx={{
                  bgcolor: '#fff',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#d1d5db',
                  },
                }}
              >
                {mockVersions.map((version) => (
                  <MenuItem key={version} value={version}>
                    {version}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="contained"
              onClick={handleCommit}
              sx={{
                bgcolor: '#4f46e5',
                '&:hover': {
                  bgcolor: '#4338ca',
                },
                textTransform: 'none',
                px: 3,
              }}
            >
              Commit Changes
            </Button>
          </Box>
        </Box>

        {/* Editor content */}
        {selectedId && selectedItem?.type === 'file' ? (
          <Box sx={{ flex: 1, overflow: 'hidden' }}>
            <JdmEditorComponent
              value={selectedItem?.graph}
              onChange={handleGraphChange}
            />
          </Box>
        ) : (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#9ca3af',
            }}
          >
            Select a file to edit
          </Box>
        )}
      </Box>
    </Box>
  );
}