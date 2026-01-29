'use client';

import { Menu, MenuItem } from '@mui/material';

export default function AddMenu({
  anchorEl,
  open,
  onClose,
  onFile,
  onFolder,
}: any) {
  return (
    <Menu anchorEl={anchorEl} open={open} onClose={onClose}>
      <MenuItem onClick={onFile}>File</MenuItem>
      <MenuItem onClick={onFolder}>Folder</MenuItem>
    </Menu>
  );
}
