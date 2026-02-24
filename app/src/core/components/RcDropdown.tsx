"use client";

import React, { useState, type MouseEvent } from "react";
import { Button, Menu, MenuItem, Box, Typography } from "@mui/material";
import FolderIcon from '@mui/icons-material/Folder';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CheckIcon from '@mui/icons-material/Check';
import { brmsTheme } from '../theme/brmsTheme';
import { RcDropdownProps } from "../types/commonTypes";

const RcDropdown: React.FC<RcDropdownProps> = ({
  label,
  items,
  onSelect,
  startIcon,
  disabled = false,
  fullWidth = false,
  value = null,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedValue, setSelectedValue] = useState<string | null>(value || null);
  const open = Boolean(anchorEl);

  const handleOpen = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelectItem = (itemValue: string) => {
    setSelectedValue(itemValue);
    handleClose();
    onSelect(itemValue);
  };

  // Find the label of the selected item
  const selectedLabel = items.find(item => item.value === selectedValue)?.label || label;

  return (
    <>
      <Button variant="outlined"
        color="inherit"
        onClick={handleOpen}
        fullWidth={fullWidth}
        startIcon={startIcon ?? <FolderIcon sx={{ color: brmsTheme.colors.panelIndigo }} />}
        endIcon={<KeyboardArrowDownIcon sx={{ color: brmsTheme.colors.textGray }} />}
        disabled={disabled}
        sx={{ 
          textTransform: "none",
          borderColor: brmsTheme.colors.lightBorder,
          color: selectedValue ? brmsTheme.colors.textDark : brmsTheme.colors.lightTextMid,
          fontWeight: selectedValue ? 500 : 400,
          '&:hover': {
            borderColor: brmsTheme.colors.panelIndigo,
            backgroundColor: brmsTheme.colors.primaryGlowSoft,
          }
        }}
      >
        {selectedLabel}
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        PaperProps={{
          sx: {
            border: `1px solid ${brmsTheme.colors.lightBorder}`,
            boxShadow: brmsTheme.shadows.primarySoft,
            minWidth: anchorEl?.offsetWidth || 200,
          }
        }}
      >
        {items.map((item) => (
          <MenuItem
            key={item.value}
            onClick={() => handleSelectItem(item.value)}
            selected={selectedValue === item.value}
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
              },
              backgroundColor: selectedValue === item.value ? brmsTheme.colors.primaryGlowSoft : 'transparent',
            }}
          >
            <Box display="flex" alignItems="center" gap={1} width="100%">
              {item.icon}
              <Typography variant="body2" flex={1}>{item.label}</Typography>
              {selectedValue === item.value && (
                <CheckIcon sx={{ fontSize: '18px', color: brmsTheme.colors.panelIndigo }} />
              )}
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default RcDropdown;