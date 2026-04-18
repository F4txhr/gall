'use client';

import { useMemo, useState } from 'react';
import { relationshipConfig } from '@/lib/relationship';

type TabKey = 'birthday' | 'anniversary';

function getTimeRemaining(targetIso: string): number {
  return Math.max(0, new Date(targetIso).getTime() - Date.now());
}

function formatRemaining(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${days}h ${hours}j ${minutes}m ${seconds}d`;
}

function buildProgress(targetIso: string): number {
  const now = Date.now();
  const target = new Date(targetIso).getTime();
  const oneYearMs = 365 * 24 * 60 * 60 * 1000;
  const elapsed = oneYearMs - Math.max(0, target - now);
  return Math.max(0, Math.min(100, (elapsed / oneYearMs) * 100));
}

export function CountdownTabs(): JSX.Element {
  const [tab, setTab] = useState<TabKey>('birthday');

  const mapping = useMemo(
    () => ({
      birthday: { title: 'Countdown Ulang Tahun', date: relationshipConfig.birthdayDate },
      anniversary: { title: 'Countdown Anniversary', date: relationshipConfig.anniversaryDate },
    }),
    []
  );

  const active = mapping[tab];
  const remainingMs = getTimeRemaining(active.date);
  const remainingText = formatRemaining(remainingMs);
  const progress = buildProgress(active.date);

  return (
    <section className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h2 className="text-3xl font-semibold md:text-4xl">Birthday & Anniversary Countdown</h2>

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={() => setTab('birthday')}
          className={`rounded-lg px-4 py-2 ${tab === 'birthday' ? 'bg-bucin-gold text-bucin-bg' : 'bg-bucin-card'}`}
        >
          Birthday
        </button>
        <button
          type="button"
          onClick={() => setTab('anniversary')}
          className={`rounded-lg px-4 py-2 ${tab === 'anniversary' ? 'bg-bucin-gold text-bucin-bg' : 'bg-bucin-card'}`}
        >
          Anniversary
        </button>
      </div>

      <div className="mt-8 w-full max-w-2xl rounded-2xl bg-bucin-card p-6 shadow-xl">
        <h3 className="text-xl font-semibold">{active.title}</h3>
        <p className="mt-2 text-bucin-textSecondary">
          Target: {new Date(active.date).toLocaleDateString('id-ID', { dateStyle: 'full' })}
        </p>
        <p className="mt-5 text-2xl font-bold text-bucin-gold">{remainingText}</p>

        <div className="mt-5 h-3 w-full rounded-full bg-bucin-bg">
          <div className="h-3 rounded-full bg-bucin-gold transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </section>
  );
}
