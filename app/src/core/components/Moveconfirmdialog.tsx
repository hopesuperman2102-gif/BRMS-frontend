'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';
import { MoveConfirmDialogProps } from '../types/commonTypes';

export default function MoveConfirmDialog({
  open,
  itemName,
  targetName,
  onClose,
  onConfirm,
}: MoveConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Confirm Move</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to move <strong>&quot;{itemName}&quot;</strong> to{' '}
          <strong>&quot;{targetName}&quot;</strong>?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onConfirm}>
          Move
        </Button>
      </DialogActions>
    </Dialog>
  );
}