'use client';

import { useState } from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import CreateUserLeftPanel from '@/modules/UserLifecycle/components/CreateUserLeftPanel';
import CreateUserRightPanel from '@/modules/UserLifecycle/components/CreateUserRightPanel';
import { CreateUserApi } from '@/modules/UserLifecycle/api/createUserApi';
import { CreateUserFormData } from '@/modules/UserLifecycle/types/userTypes';
import { UserManagementResponse } from '@/modules/UserLifecycle/types/userEndpointsTypes';
import { brmsTheme } from '@/core/theme/brmsTheme';
import RcAlertComponent, { useAlertStore } from '@/core/components/RcAlertComponent';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PageRoot = styled(Box)({
  height: '100vh',
  width: '100%',
  display: 'flex',
  overflow: 'hidden',
  background: brmsTheme.colors.bgRoot,
  fontFamily: '"DM Sans", "Inter", sans-serif',
});

export default function CreateUserPage() {
  const { showAlert } = useAlertStore();
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
  const [newUser, setNewUser] = useState<UserManagementResponse | null>(null); // ← new
  const [resetKey, setResetKey] = useState(0);     

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

    const failValidation = (message: string) => {
      setError(message);
      showAlert(message, 'error');
    };

    if (!formData.username.trim()) { failValidation('Username is required.'); return; }
    if (formData.username.trim().length < 3) { failValidation('Username must be at least 3 characters.'); return; }
    if (!formData.email.trim()) { failValidation('Email is required.'); return; }
    if (!EMAIL_REGEX.test(formData.email.trim())) { failValidation('Please enter a valid email address.'); return; }
    if (!formData.password) { failValidation('Password is required.'); return; }
    if (formData.password.length < 8) { failValidation('Password must be at least 8 characters.'); return; }
    if (formData.password !== formData.confirmPassword) { failValidation('Passwords do not match.'); return; }
    if (!formData.roles.length) { failValidation('Please select a role.'); return; }

    setLoading(true);
    try {
      const created = await CreateUserApi.createUser({
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        roles: formData.roles,
      });

      setNewUser(created); // ← push new user to left panel
      setSuccess(true);
      setResetKey(prev => prev + 1);
      setFormData({ username: '', email: '', password: '', confirmPassword: '', roles: [] });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create user. Please try again.';
      setError(message);
      showAlert(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageRoot>
      <CreateUserLeftPanel newUser={newUser} /> 
      <CreateUserRightPanel
        formData={formData}
        loading={loading}
        error={error}
        success={success}
        onChange={handleChange}
        onRoleSelect={handleRoleSelect}
        onSubmit={handleSubmit}
        resetKey={resetKey}
      />
      <RcAlertComponent />
    </PageRoot>
  );
}
