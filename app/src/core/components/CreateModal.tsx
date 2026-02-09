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
} from '@mui/material';

export type CreateModalProps = {
  open: boolean;
  onClose: () => void;
  onCreate: (data: { [key: string]: string }) => Promise<{ success: boolean; error?: string }>;
  title?: string;
  fields?: Array<{ name: string; label: string; required?: boolean }>;
};

export function CreateModal({
  open,
  onClose,
  onCreate,
  title = 'Create project',
  fields = [{ name: 'name', label: 'Name', required: true }],
}: CreateModalProps) {
  const [formData, setFormData] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (fieldName: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
    
    if (errorMessage) setErrorMessage('');
    if (fieldErrors[fieldName]) {
      setFieldErrors((prev) => {
        const { [fieldName]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const validateFields = (): boolean => {
    const errors: { [key: string]: string } = {};
    
    fields.forEach((field) => {
      if (field.required && !formData[field.name]?.trim()) {
        errors[field.name] = `${field.label} is required`;
      }
    });
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateFields()) return;

    setLoading(true);
    setErrorMessage('');
    
    try {
      const result = await onCreate(formData);
      
      if (result.success) {
        setFormData({});
        setFieldErrors({});
        setErrorMessage('');
        onClose();
      } else {
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
    setFieldErrors({});
    setErrorMessage('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1, minWidth: 400 }}>
          {fields.map((field, index) => (
            <TextField
              key={field.name}
              autoFocus={index === 0}
              label={field.label}
              fullWidth
              value={formData[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              disabled={loading}
              required={field.required}
              error={!!fieldErrors[field.name]}
              helperText={fieldErrors[field.name]}
            />
          ))}
          {errorMessage && (
            <Typography variant="caption" color="error">
              {errorMessage}
            </Typography>
          )}
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