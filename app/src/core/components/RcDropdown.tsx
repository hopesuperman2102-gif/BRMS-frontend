"use client";

import React, { useState, type MouseEvent } from "react";
import { Button, Menu, MenuItem, Box, Typography } from "@mui/material";
import FolderIcon from '@mui/icons-material/Folder';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { brmsTheme } from '../theme/brmsTheme';

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
        startIcon={startIcon ?? <FolderIcon sx={{ color: brmsTheme.colors.panelIndigo }} />}
        endIcon={<KeyboardArrowDownIcon sx={{ color: brmsTheme.colors.textGray }} />}
        disabled={disabled}
        sx={{ 
          textTransform: "none",
          borderColor: brmsTheme.colors.lightBorder,
          color: brmsTheme.colors.textDark,
          '&:hover': {
            borderColor: brmsTheme.colors.panelIndigo,
            backgroundColor: brmsTheme.colors.primaryGlowSoft,
          }
        }}
      >
        {label}
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            border: `1px solid ${brmsTheme.colors.lightBorder}`,
            boxShadow: brmsTheme.shadows.primarySoft,
          }
        }}
      >
        {items.map((item) => (
        <MenuItem
          key={item.label}
          onClick={() => {
          handleClose();
          onSelect(item.value);
          }}
          sx={item.isAddNew ? { 
            color: brmsTheme.colors.primary, 
            fontWeight: 600,
            '&:hover': {
              backgroundColor: brmsTheme.colors.primaryGlowSoft,
            }
          } : {
            color: brmsTheme.colors.textDark,
            '&:hover': {
              backgroundColor: brmsTheme.colors.lightSurfaceHover,
            }
          }}
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
