"use client";

import React, { useState, type MouseEvent } from "react";
import { Button, Menu, MenuItem, Box, Typography } from "@mui/material";
import FolderIcon from '@mui/icons-material/Folder';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

export type RcDropdownItem = {
  label: string;
  value: string;
  icon?: React.ReactNode;
  isAddNew?: boolean; 
};

export type RcDropdownProps = {
  label: string;
  items: RcDropdownItem[];
  onSelect: (value: string) => void;
  startIcon?: React.ReactNode;
  disabled?: boolean;
};

const RcDropdown: React.FC<RcDropdownProps> = ({
  label,
  items,
  onSelect,
  startIcon,
  disabled = false,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Button variant="outlined"
        color="inherit"
        onClick={handleOpen}
        startIcon={startIcon ?? <FolderIcon />}
        endIcon={<KeyboardArrowDownIcon/>}
        disabled={disabled}
        sx={{ textTransform: "none" }}
      >
        {label}
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {items.map((item) => (
        <MenuItem
          key={item.label}
          onClick={() => {
          handleClose();
          onSelect(item.value);
          }}
          sx={item.isAddNew ? { color: 'primary.main', fontWeight: 500 } : {}}
        >
            <Box display="flex" alignItems="center" gap={1}>
              {item.icon}
              <Typography variant="body2">{item.label}</Typography>
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default RcDropdown;
