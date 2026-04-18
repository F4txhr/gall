import { redirect } from 'next/navigation';
import { getSessionRole } from '@/lib/auth';

export default async function AppEntryPage(): Promise<never> {
  const role = await getSessionRole();
  redirect(role ? `/app/${role}` : '/login');
}
