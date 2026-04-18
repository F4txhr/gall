'use client';

import { useEffect, useMemo, useState } from 'react';
import { relationshipConfig } from '@/lib/relationship';

type Duration = { days: number; hours: number; minutes: number; seconds: number };

function getDuration(startIso: string): Duration {
  const diff = Math.max(0, Date.now() - new Date(startIso).getTime());
  const totalSeconds = Math.floor(diff / 1000);

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds };
}

function CounterBox({ label, value }: { label: string; value: number }): JSX.Element {
  return (
    <div className="min-w-24 rounded-xl bg-bucin-cream px-4 py-3 text-center text-bucin-bg shadow-md">
      <div className="text-2xl font-bold md:text-3xl">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-wide">{label}</div>
    </div>
  );
}

export function LoveCounter(): JSX.Element {
  const [duration, setDuration] = useState<Duration>(() => getDuration(relationshipConfig.relationshipStart));

  useEffect(() => {
    const timer = setInterval(() => {
      setDuration(getDuration(relationshipConfig.relationshipStart));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const title = useMemo(
    () => `Sudah bersama sejak ${new Date(relationshipConfig.relationshipStart).toLocaleDateString('id-ID')}`,
    []
  );

  return (
    <section className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h2 className="text-3xl font-semibold md:text-4xl">Love Counter</h2>
      <p className="mt-3 text-bucin-textSecondary">{title}</p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <CounterBox label="Hari" value={duration.days} />
        <CounterBox label="Jam" value={duration.hours} />
        <CounterBox label="Menit" value={duration.minutes} />
        <CounterBox label="Detik" value={duration.seconds} />
      </div>
    </section>
  );
}
