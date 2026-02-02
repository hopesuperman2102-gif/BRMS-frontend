'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
} from '@mui/material';

/* ---------- Types ---------- */
type ProjectItem = {
  id: string;
  name: string;
  type: 'file' | 'folder';
  updatedAt: string;
};

/* ---------- Page ---------- */
export default function ProjectRulePage() {
  const { projectId } = useParams<{ projectId: string }>();
  const router = useRouter();

  const [items, setItems] = useState<ProjectItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ProjectItem | null>(null);

  /* ---------- Mock API ---------- */
  useEffect(() => {
    // later replace this with API call: /api/projects/{projectId}/files
    setItems([
      {
        id: '1',
        name: 'project1',
        type: 'folder',
        updatedAt: '15 minutes ago',
      },
      {
        id: '2',
        name: 'rules.json',
        type: 'file',
        updatedAt: '10 minutes ago',
      },
    ]);
  }, [projectId]);

  /* ---------- Button Label ---------- */
  const getActionLabel = () => {
    if (!selectedItem) return 'Open editor';
    return selectedItem.type === 'folder'
      ? 'Open folder'
      : 'Open file';
  };

  /* ---------- Button Action ---------- */
  const handleOpenAction = () => {
    if (!selectedItem) {
      router.push(`/projects/${projectId}/rules`);
      return;
    }

    if (selectedItem.type === 'folder') {
      console.log('Open folder:', selectedItem.id);
      return;
    }

    router.push(
      `/projects/${projectId}/rules?file=${selectedItem.id}`
    );
  };

  return (
    <Card>
      <CardContent
        sx={{
          maxHeight: 500,
          overflowY: 'auto',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {/* ---------- Header ---------- */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            mb: 2,
          }}
        >
          <Typography variant="h6">{projectId}</Typography>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              size="small"
              placeholder="Search"
            />
            <Button
              variant="contained"
              onClick={handleOpenAction}
            >
              {getActionLabel()}
            </Button>
          </Box>
        </Box>

        {/* ---------- Table Header ---------- */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            borderBottom: 1,
            borderColor: 'divider',
            pb: 1,
            mb: 1,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Name
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Last updated
          </Typography>
        </Box>

        {/* ---------- File / Folder List ---------- */}
        {items.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No files found for this project.
            </Typography>
          </Box>
        ) : (
          items.map((item) => (
            <Box
              key={item.id}
              onClick={() => setSelectedItem(item)}
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                py: 2,
                px: 1,
                borderRadius: 1,
                cursor: 'pointer',
                backgroundColor:
                  selectedItem?.id === item.id
                    ? '#EEF2FF'
                    : 'transparent',
                '&:hover': {
                  backgroundColor: '#F5F7FF',
                },
              }}
            >
              <Typography variant="body2">
                {item.name}
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
              >
                {item.updatedAt}
              </Typography>
            </Box>
          ))
        )}
      </CardContent>
    </Card>
  );
}