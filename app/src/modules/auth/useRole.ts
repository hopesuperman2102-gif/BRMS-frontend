import { useAuth } from './Authcontext';

export function useRole() {
  const { roles } = useAuth();

  const hasRole = (role: string): boolean =>
    roles.map((r) => r.toUpperCase()).includes(role.toUpperCase());

  const isRuleAuthor = hasRole('RULE_AUTHOR');
  const isSuperAdmin = hasRole('SUPER_ADMIN');
  const isAdmin = hasRole('ADMIN');

  return {
    roles,
    hasRole,
    isRuleAuthor,
    isSuperAdmin,
    isAdmin,
  };
}