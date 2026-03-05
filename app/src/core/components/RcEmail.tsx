'use client';

import { useState } from 'react';
import { TextField, InputAdornment } from '@mui/material';
import { RcEmailProps } from '@/core/types/commonTypes';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RcEmail({
  value,
  onChange,
  name = 'emailid',
  placeholder = 'e.g. john.doe@example.com',
  required = false,
  autoComplete = 'email',
  startIcon,
  sx,
  onFocus,
  onBlur,
}: RcEmailProps) {
  const [touched, setTouched] = useState(false);

  const error = touched && (!value
    ? (required ? 'Email is required' : '')
    : !EMAIL_REGEX.test(value)
    ? 'Enter a valid email address'
    : '');

  const handleBlur = () => {
    setTouched(true);
    onBlur?.();
  };

  return (
    <TextField
      fullWidth
      name={name}
      type="email"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={handleBlur}
      autoComplete={autoComplete}
      error={!!error}
      helperText={error || ''}
      required={required}
      InputProps={
  startIcon
    ? { startAdornment: <InputAdornment position="start">{startIcon}</InputAdornment> }
    : undefined
}
      sx={sx}
    />
  );
}