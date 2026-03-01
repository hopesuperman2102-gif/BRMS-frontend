'use client';

import { TextField } from '@mui/material';
import { RcTextAreaProps } from '../types/commonTypes';

export default function RcTextArea({
  name,
  value,
  onChange,
  onFocus,
  onBlur,
  placeholder,
  maxLength = 300,
  rows = 3,
  sx,
}: RcTextAreaProps) {
  return (
    <TextField
      fullWidth
      multiline
      name={name}
      rows={rows}
      value={value}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      placeholder={placeholder}
      inputProps={{ maxLength }}
      sx={sx}
    />
  );
}