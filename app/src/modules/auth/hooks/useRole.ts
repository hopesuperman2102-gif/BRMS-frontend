import { useAuth } from '@/modules/auth/context/Authcontext';

export function useRole() {
  const { roles } = useAuth();

  const hasRole = (role: string): boolean =>
    roles.map((r) => r.toUpperCase()).includes(role.toUpperCase());

  const isRuleAuthor = hasRole('RULE_AUTHOR');
  const isSuperAdmin = hasRole('SUPER_ADMIN');
  const isReviewer = hasRole('REVIEWER');
  const isViewer = hasRole('VIEWER');

  return {
    roles,
    hasRole,
    isRuleAuthor,
    isSuperAdmin,
    isReviewer,
    isViewer,
  };
}