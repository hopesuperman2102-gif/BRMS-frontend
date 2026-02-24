'use client';

import { useState } from 'react';
import { Box } from '@mui/material';
import CreateUserLeftPanel from '../components/CreateUserLeftPanel';
import CreateUserRightPanel, { CreateUserFormData } from '../components/CreateUserRightPanel';
import { CreateUserApi } from '../api/createUserApi';


/* ─── Email Validation Regex ────────────────────────────────── */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ─── Page ──────────────────────────────────────────────────── */
export default function CreateUserPage() {
  const [formData, setFormData] = useState<CreateUserFormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    roles: [],
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
    setSuccess(false);
  };

  const handleRoleSelect = (role: string) => {
    setFormData(prev => ({ ...prev, roles: [role] }));
    setError('');
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // ─── Client-side validation ───
    if (!formData.username.trim()) {
      setError('Username is required.');
      return;
    }

    if (formData.username.trim().length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }

    if (!formData.email.trim()) {
      setError('Email is required.');
      return;
    }

    if (!EMAIL_REGEX.test(formData.email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!formData.password) {
      setError('Password is required.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!formData.roles.length) {
      setError('Please select a role.');
      return;
    }

    setLoading(true);

    try {
      await CreateUserApi.createUser({
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        roles: formData.roles,
      });

      setSuccess(true);

      // ─── Reset form after successful creation ───
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        roles: [],
      });

      // ─── Clear success message after 3 seconds ───
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to create user. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100%',
        display: 'flex',
        overflow: 'hidden',
        background: '#0A0C10',
        fontFamily: '"DM Sans", "Inter", sans-serif',
      }}
    >
      <CreateUserLeftPanel />
      <CreateUserRightPanel
        formData={formData}
        loading={loading}
        error={error}
        success={success}
        onChange={handleChange}
        onRoleSelect={handleRoleSelect}
        onSubmit={handleSubmit}
      />
    </Box>
  );
}