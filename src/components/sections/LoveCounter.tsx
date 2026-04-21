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
    <div className="min-w-24 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-center backdrop-blur-sm">
      <div className="text-2xl font-bold text-bucin-gold md:text-3xl">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-wide text-bucin-textSecondary">{label}</div>
    </div>
  );
}

export function LoveCounter({ config }: { config?: any }): JSX.Element {
  const [duration, setDuration] = useState<Duration | null>(null);
  const startDate = config?.relationshipStart || relationshipConfig.relationshipStart;

  useEffect(() => {
    // Set initial duration on client
    setDuration(getDuration(startDate));

    const timer = setInterval(() => {
      setDuration(getDuration(startDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [startDate]);

  const title = useMemo(
    () => `Bersama sejak ${new Date(startDate).toLocaleDateString('id-ID')}`,
    [startDate]
  );

  if (!duration) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-3 opacity-0">
         <CounterBox label="Hari" value={0} />
      </div>
    );
  }

  return (
    <div id="counter" className="mx-auto flex w-full flex-col items-center justify-center text-center">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <CounterBox label="Hari" value={duration.days} />
        <CounterBox label="Jam" value={duration.hours} />
        <CounterBox label="Menit" value={duration.minutes} />
        <CounterBox label="Detik" value={duration.seconds} />
      </div>
      <p className="mt-4 text-[10px] text-bucin-textSecondary uppercase tracking-widest">{title}</p>
    </div>
  );
}
