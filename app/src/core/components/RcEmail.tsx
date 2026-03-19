'use client';

import { useState } from 'react';
import { TextField, InputAdornment } from '@mui/material';
import { RcEmailProps } from '@/core/types/commonTypes';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RcEmail({
  value,
  onChange,
  name = 'emailid',
  label,
  placeholder = 'e.g. john.doe@example.com',
  required = false,
  autoComplete = 'email',
  startIcon,
  sx,
  className,
  onFocus,
  onBlur,
  resetKey,
}: RcEmailProps) {
  const [touched, setTouched] = useState(false);
  const [prevResetKey, setPrevResetKey] = useState(resetKey);

  if (prevResetKey !== resetKey) {
    setPrevResetKey(resetKey);
    setTouched(false);
  }

  const error =
    touched &&
    (!value
      ? required
        ? `${label ?? 'Email'} is required`
        : ''
      : !EMAIL_REGEX.test(value)
        ? 'Invalid email format'
        : '');

  return (
    <TextField
      className={className}
      fullWidth
      name={name}
      type='email'
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={() => {
        setTouched(true);
        onBlur?.();
      }}
      autoComplete={autoComplete}
      error={!!error}
      helperText={error || ''}
      required={required}
      InputProps={
        startIcon
          ? { startAdornment: <InputAdornment position='start'>{startIcon}</InputAdornment> }
          : undefined
      }
      sx={sx}
    />
  );
}
