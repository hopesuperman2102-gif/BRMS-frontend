'use client';

import { useNavigate } from 'react-router-dom';
import RcLeftPanel from '@/core/components/RcLeftPanel';
import UserListCard from '@/modules/UserLifecycle/components/UserListCard';
import { CreateUserLeftPanelProps } from '@/modules/UserLifecycle/types/userTypes';

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
