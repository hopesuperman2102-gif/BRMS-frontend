'use client';

import { Menu, MenuItem } from '@mui/material';

type AddMenuProps = {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onFile: () => void;
  onFolder: () => void;
};

export default function AddMenu({
  anchorEl,
  open,
  onClose,
  onFile,
  onFolder,
}: AddMenuProps) {
  return (
    <Menu anchorEl={anchorEl} open={open} onClose={onClose}>
      <MenuItem
        onClick={() => {
          onFile();
          onClose();
        }}
      >
        File
      </MenuItem>
      <MenuItem
        onClick={() => {
          onFolder();
          onClose();
        }}
      >
        Folder
      </MenuItem>
    </Menu>
  );
}