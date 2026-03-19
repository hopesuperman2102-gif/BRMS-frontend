'use client';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { brmsTheme } from '@/core/theme/brmsTheme';
import { useAuth } from '@/modules/auth/context/Authcontext';
import { loginApi } from '@/modules/auth/services/Authservice';
import LoginLeftPanel from '@/modules/auth/components/Loginleftpanel';
import LoginRightPanel from '@/modules/auth/components/Loginrightpanel';

const PageRoot = styled(Box)({
  height: '100vh',
  width: '100%',
  display: 'flex',
  overflow: 'hidden',
  background: brmsTheme.colors.bgDark,
  fontFamily: '"DM Sans", "Inter", sans-serif',
});

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAccessToken, setIsAuthenticated, setRoles } = useAuth();

  const [formData, setFormData] = useState({ username: '', emailid: '', password: '' });
  const [loginMode, setLoginMode] = useState<'username' | 'email'>('username');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const identifier = loginMode === 'username' ? formData.username : formData.emailid;
    if (!identifier || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const { accessToken, roles } = await loginApi(
        loginMode === 'username'
          ? { username: formData.username, password: formData.password }
          : { emailid: formData.emailid, password: formData.password }
      );
      setAccessToken(accessToken);
      setIsAuthenticated(true);
      setRoles(roles);
      navigate('/vertical');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageRoot>
      <LoginLeftPanel />
      <LoginRightPanel
        formData={formData}
        loginMode={loginMode}
        setLoginMode={setLoginMode}
        loading={loading}
        error={error}
        onChange={handleChange}
        onSubmit={handleSubmit}
      />
    </PageRoot>
  );
}