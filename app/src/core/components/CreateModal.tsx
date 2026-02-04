'use client';

import React, { useState,useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
} from '@mui/material';

export type CreateModalProps = {
  open: boolean;
  onClose: () => void;
  onCreate: (data: { [key: string]: string }) => void;
  title?: string;
  fields?: Array<{ name: string; label: string }>;
  initialValues?: { [key: string]: string };
  submitLabel?: string; // NEW
};

export function CreateModal({
  open,
  onClose,
  onCreate,
  title = 'Create project',
  fields = [{ name: 'name', label: 'Name' }],
  initialValues = {},
  submitLabel = 'Create', // DEFAULT
}: CreateModalProps) {

  const [formData, setFormData] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (fieldName: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  useEffect(() => {
  if (open) {
    setFormData(initialValues);
  }
}, [open, initialValues]);

  const handleSubmit = async () => {
    // Check if all fields have values
    const hasEmptyFields = fields.some((field) => !formData[field.name]?.trim());
    if (hasEmptyFields) return;

    setLoading(true);
    await onCreate(formData);
    setFormData({});
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
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
            />
          ))}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? `${submitLabel}...` : submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
 