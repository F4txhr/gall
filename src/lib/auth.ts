import { cookies } from 'next/headers';

export type UserRole = 'cowo' | 'cewe';

export const SESSION_COOKIE = 'wb_role';

const validRoles: UserRole[] = ['cowo', 'cewe'];

export function isValidRole(value: string): value is UserRole {
  return validRoles.includes(value as UserRole);
}

export function getPasswordForRole(role: UserRole): string {
  const fallback = role === 'cowo' ? 'cowologin' : 'cewelogin';
  return process.env[role === 'cowo' ? 'COWO_PASSWORD' : 'CEWE_PASSWORD'] ?? fallback;
}

export async function getSessionRole(): Promise<UserRole | null> {
  const store = await cookies();
  const role = store.get(SESSION_COOKIE)?.value;
  return role && isValidRole(role) ? role : null;
}
