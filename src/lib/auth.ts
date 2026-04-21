import { cookies } from 'next/headers';
import { supabase } from './supabase';

export type UserRole = 'cowo' | 'cewe';
export const SESSION_COOKIE = 'wb_role';
const validRoles: UserRole[] = ['cowo', 'cewe'];

export function isValidRole(value: string): value is UserRole {
  return validRoles.includes(value as UserRole);
}

// Ambil password secara dinamis dari Database
export async function getPasswordForRole(role: UserRole): Promise<string> {
  if (!supabase) return role === 'cowo' ? 'cowologin' : 'cewelogin';

  const key = role === 'cowo' ? 'cowo_password' : 'cewe_password';
  const { data } = await supabase.from('settings').select('value').eq('key', key).single();
  
  if (data?.value) return data.value;

  // Fallback ke ENV jika di DB belum ada
  const envPass = process.env[role === 'cowo' ? 'COWO_PASSWORD' : 'CEWE_PASSWORD'];
  return envPass || (role === 'cowo' ? 'cowologin' : 'cewelogin');
}

export async function getSessionRole(): Promise<UserRole | null> {
  const store = await cookies();
  const role = store.get(SESSION_COOKIE)?.value;
  return role && isValidRole(role) ? role : null;
}
