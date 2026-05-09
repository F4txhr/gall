'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function LoginForm() {
  const router = useRouter();
  const [role, setRole] = useState<'cowo' | 'cewe'>('cowo');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, password }),
    });

    const data = (await res.json()) as { ok: boolean; message?: string; role?: 'cowo' | 'cewe' };

    setLoading(false);

    if (!res.ok || !data.ok || !data.role) {
      setError(data.message || 'Login gagal. Cek kembali password kamu.');
      return;
    }

    router.push(`/app/${data.role}`);
    setTimeout(() => {
      router.refresh();
    }, 500);
  };

  return (
    <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 rounded-2xl bg-bucin-card p-6 shadow-xl">
      <h1 className="text-center text-2xl font-semibold text-bucin-text">Login Web Bucin</h1>

      <div className="space-y-2">
        <label className="block text-sm text-bucin-textSecondary">Masuk sebagai</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as 'cowo' | 'cewe')}
          className="w-full rounded-lg border border-bucin-hover bg-bucin-bg px-3 py-2 text-bucin-text"
        >
          <option value="cowo">Cowo</option>
          <option value="cewe">Cewe</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="block text-sm text-bucin-textSecondary">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full rounded-lg border border-bucin-hover bg-bucin-bg px-3 py-2 text-bucin-text placeholder:text-bucin-textSecondary"
          required
        />
      </div>

      {error ? <p className="text-sm text-red-300">{error}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-bucin-gold px-4 py-2 font-semibold text-bucin-bg transition hover:bg-bucin-hover disabled:opacity-70"
      >
        {loading ? 'Memproses...' : 'Masuk'}
      </button>
    </form>
  );
}
