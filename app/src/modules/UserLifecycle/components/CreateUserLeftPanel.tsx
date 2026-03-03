'use client';

import { useNavigate } from 'react-router-dom';
import RcLeftPanel from 'app/src/core/components/RcLeftPanel';
import UserListCard from './UserListCard';
import { CreateUserLeftPanelProps } from '../types/userTypes';

export default function CreateUserLeftPanel({ newUser }: CreateUserLeftPanelProps) {
  const navigate = useNavigate();

  return (
    <RcLeftPanel
      variant="create"
      backLabel="Back"
      onBack={() => navigate(-1)}
      width="60%"
    >
      <UserListCard newUser={newUser} />
    </RcLeftPanel>
  );
}