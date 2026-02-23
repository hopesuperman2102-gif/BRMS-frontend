'use client';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { useAuth } from '../Authcontext';
import { loginApi } from '../Authservice';
import LoginLeftPanel from '../components/Loginleftpanel';
import LoginRightPanel from '../components/Loginrightpanel';


export default function LoginPage() {
  const navigate = useNavigate();
  const { setAccessToken, setIsAuthenticated } = useAuth();

  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.username || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const accessToken = await loginApi({ username: formData.username, password: formData.password });
      setAccessToken(accessToken);
      setIsAuthenticated(true);
      navigate('/vertical');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
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
      <LoginLeftPanel />
      <LoginRightPanel
        formData={formData}
        loading={loading}
        error={error}
        onChange={handleChange}
        onSubmit={handleSubmit}
      />
    </Box>
  );
}