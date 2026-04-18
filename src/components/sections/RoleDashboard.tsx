'use client';

import { useRouter } from 'next/navigation';

export function RoleDashboard({ role }: { role: 'cowo' | 'cewe' }): JSX.Element {
  const router = useRouter();

  const logout = async (): Promise<void> => {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-bucin-bg px-4 text-bucin-text">
      <section className="w-full max-w-xl rounded-2xl bg-bucin-card p-8 shadow-xl">
        <h1 className="text-3xl font-bold">Halo, {role === 'cowo' ? 'Cowo' : 'Cewe'} 💛</h1>
        <p className="mt-3 text-bucin-textSecondary">
          Login system Phase 2 sudah aktif dengan session berbasis cookie dan redirect sesuai role.
        </p>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="rounded-lg border border-bucin-gold px-4 py-2 text-bucin-text transition hover:bg-bucin-gold hover:text-bucin-bg"
          >
            Kembali ke Home
          </button>
          <button
            type="button"
            onClick={logout}
            className="rounded-lg bg-bucin-gold px-4 py-2 font-semibold text-bucin-bg transition hover:bg-bucin-hover"
          >
            Logout
          </button>
        </div>
      </section>
    </main>
  );
}
