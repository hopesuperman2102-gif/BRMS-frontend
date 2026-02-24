'use client';

import { useState } from 'react';
import { Box } from '@mui/material';
import CreateUserLeftPanel from '../components/CreateUserLeftPanel';
import CreateUserRightPanel, { CreateUserFormData } from '../components/CreateUserRightPanel';


/* ─── Placeholder — swap with your real API call ────────────── */
async function createUserApi(data: { username: string; password: string }): Promise<void> {
  // Replace with your actual endpoint, e.g.:
  // await apiClient.post('/users', data);
  await new Promise(res => setTimeout(res, 900));
  if (!data.username || !data.password) throw new Error('Invalid payload');
}

/* ─── Page ──────────────────────────────────────────────────── */

export default function CreateUserPage() {
  const [formData, setFormData] = useState<CreateUserFormData>({
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Client-side validation
    if (!formData.username.trim()) {
      setError('Username is required.');
      return;
    }
    if (formData.username.trim().length < 3) {
      setError('Username must be at least 3 characters.');
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

    setLoading(true);
    try {
      await createUserApi({ username: formData.username.trim(), password: formData.password });
      setSuccess(true);
      // Reset form after successful creation
      setFormData({ username: '', password: '', confirmPassword: '' });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create user. Please try again.');
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
        onSubmit={handleSubmit}
      />
    </Box>
  );
}