'use client';

import { useState } from 'react';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { RcPasswordProps } from '@/core/types/commonTypes';

export default function RcPasswordField({
  name,
  value,
  onChange,
  onFocus,
  onBlur,
  placeholder = '••••••••',
  autoComplete = 'current-password',
  maxLength = 128,
  startIcon,
  sx,
}: RcPasswordProps) {
  const [show, setShow] = useState(false);

  return (
    <TextField
      fullWidth
      name={name}
      type={show ? 'text' : 'password'}
      value={value}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      placeholder={placeholder}
      autoComplete={autoComplete}
      inputProps={{ maxLength }}
      InputProps={{
        startAdornment: startIcon
          ? <InputAdornment position="start">{startIcon}</InputAdornment>
          : undefined,
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              onClick={() => setShow(!show)}
              edge="end"
              disableRipple
              sx={{ color: 'inherit', mr: '-4px' }}
            >
              {show ? <VisibilityOff sx={{ fontSize: '16px' }} /> : <Visibility sx={{ fontSize: '16px' }} />}
            </IconButton>
          </InputAdornment>
        ),
      }}
      sx={sx}
    />
  );
}