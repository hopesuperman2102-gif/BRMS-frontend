'use client';

import { TextField, InputAdornment } from '@mui/material';
import { RcInputProps } from '../types/commonTypes';

export default function RcInputField({
  name,
  value,
  onChange,
  onFocus,
  onBlur,
  placeholder,
  autoComplete,
  maxLength = 100,
  startIcon,
  sx,
}: RcInputProps) {
  return (
    <TextField
      fullWidth
      name={name}
      value={value}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      placeholder={placeholder}
      autoComplete={autoComplete}
      inputProps={{ maxLength }}
      InputProps={
        startIcon
          ? { startAdornment: <InputAdornment position="start">{startIcon}</InputAdornment> }
          : undefined
      }
      sx={sx}
    />
  );
}