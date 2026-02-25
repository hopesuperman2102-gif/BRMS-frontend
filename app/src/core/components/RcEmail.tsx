'use client';

import { useState } from 'react';
import { Box, TextField, Typography } from '@mui/material';
import { RcEmailProps } from '../types/commonTypes';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RcEmail({
  value,
  onChange,
  name = 'email',
  label,
  placeholder = 'e.g. john.doe@example.com',
  required = false,
  sx,
  onFocus,
  onBlur,
}: RcEmailProps) {
  const [touched, setTouched] = useState(false);
  
    const error = touched && (!value 
        ? 'Email is required' 
        : !EMAIL_REGEX.test(value) 
        ? 'Enter a valid email address' 
        : '');

  const handleBlur = () => {
    setTouched(true);
    onBlur?.();
  };

  return (
    <Box>
      {label && (
        <Typography variant="caption" display="block" mb={0.75}>
          {label} {required && <span>*</span>}
        </Typography>
      )}

      <TextField
        fullWidth
        name={name}
        type="email"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={handleBlur}
        autoComplete="email"
        error={!!error}
        helperText={error || ''}
        required={required}
        sx={sx}
      />
    </Box>
  );
}