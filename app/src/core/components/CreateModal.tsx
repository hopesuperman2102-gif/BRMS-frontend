'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Typography,
  Box,
} from '@mui/material';

export type CreateModalProps = {
  open: boolean;
  onClose: () => void;
  onCreate: (data: { [key: string]: string }) => Promise<{ success: boolean; error?: string }>;
  title?: string;
  fields?: Array<{ name: string; label: string }>;
};

export function CreateModal({
  open,
  onClose,
  onCreate,
  title = 'Create project',
  fields = [{ name: 'name', label: 'Name' }],
}: CreateModalProps) {
  const [formData, setFormData] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleChange = (fieldName: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
    // Clear error when user types
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const handleCreate = async () => {
    // Check if all fields have values
    const hasEmptyFields = fields.some((field) => !formData[field.name]?.trim());
    if (hasEmptyFields) return;

    setLoading(true);
    setErrorMessage('');
    
    try {
      const result = await onCreate(formData);
      
      if (result.success) {
        // Success - close modal and clear form
        setFormData({});
        setErrorMessage('');
        onClose();
      } else {
        // Failed - show error under input
        setErrorMessage(result.error || 'An error occurred');
      }
    } catch (error) {
      console.error('Error creating:', error);
      setErrorMessage('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({});
    setErrorMessage('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1, minWidth: 400 }}>
          {fields.map((field, index) => (
            <Box key={field.name}>
              <TextField
                autoFocus={index === 0}
                label={field.label}
                fullWidth
                value={formData[field.name] || ''}
                onChange={(e) => handleChange(field.name, e.target.value)}
                disabled={loading}
                error={index === 0 && !!errorMessage}
              />
              {index === 0 && errorMessage && (
                <Typography 
                  variant="caption" 
                  color="error" 
                  sx={{ mt: 0.5, display: 'block' }}
                >
                  {errorMessage}
                </Typography>
              )}
            </Box>
          ))}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleCreate} variant="contained" disabled={loading}>
          {loading ? 'Creating...' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}