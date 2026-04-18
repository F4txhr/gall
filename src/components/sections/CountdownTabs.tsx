'use client';

import { relationshipConfig } from '@/lib/relationship';

type CountdownItem = {
  title: string;
  dateIso: string;
};

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

function CountdownCard({ title, dateIso }: CountdownItem): JSX.Element {
  const remainingMs = getTimeRemaining(dateIso);
  const remainingText = formatRemaining(remainingMs);
  const progress = buildProgress(dateIso);

  return (
    <article className="w-full max-w-2xl rounded-2xl bg-bucin-card p-6 text-left shadow-xl">
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-bucin-textSecondary">
        Target: {new Date(dateIso).toLocaleDateString('id-ID', { dateStyle: 'full' })}
      </p>
      <p className="mt-5 text-2xl font-bold text-bucin-gold">{remainingText}</p>

      <div className="mt-5 h-3 w-full rounded-full bg-bucin-bg">
        <div className="h-3 rounded-full bg-bucin-gold transition-all" style={{ width: `${progress}%` }} />
      </div>
    </article>
  );
}

export function CountdownTabs(): JSX.Element {
  const countdownItems: CountdownItem[] = [
    { title: 'Anniversary', dateIso: relationshipConfig.anniversaryDate },
    { title: 'Ulang Tahun Cowo', dateIso: relationshipConfig.birthdayCowoDate },
    { title: 'Ulang Tahun Cewe', dateIso: relationshipConfig.birthdayCeweDate },
  ];

  return (
    <section className="flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center">
      <h2 className="text-3xl font-semibold md:text-4xl">Countdown</h2>
      <p className="mt-3 text-bucin-textSecondary">Anniv, ultah cowo, dan ultah cewe langsung tampil semua per card.</p>

      <div className="mt-8 flex w-full flex-col items-center gap-5">
        {countdownItems.map((item) => (
          <CountdownCard key={item.title} title={item.title} dateIso={item.dateIso} />
        ))}
      </div>
    </section>
  );
}
