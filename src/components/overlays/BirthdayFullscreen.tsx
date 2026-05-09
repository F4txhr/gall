'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { relationshipConfig } from '@/lib/relationship';

type BirthdayTarget = {
  key: 'cowo' | 'cewe';
  name: string;
  date: string;
};

function isTodayBirthday(dateIso: string): boolean {
  const now = new Date();
  const target = new Date(dateIso);
  return now.getDate() === target.getDate() && now.getMonth() === target.getMonth();
}

export function BirthdayFullscreen({ config, force = false }: { config?: any; force?: boolean }) {
  const [dismissed, setDismissed] = useState(false);
  const params = useSearchParams();
  const forcedByQuery = params.get('birthday') === '1';

  const activeBirthday = useMemo(() => {
    const cfg = config || relationshipConfig;
    const list: BirthdayTarget[] = [
      { key: 'cowo', name: cfg.partnerA, date: cfg.birthdayCowoDate },
      { key: 'cewe', name: cfg.partnerB, date: cfg.birthdayCeweDate },
    ];

    if (forcedByQuery || force) return list[0];
    return list.find((t) => isTodayBirthday(t.date)) || null;
  }, [config, forcedByQuery, force]);

  if (!activeBirthday || dismissed) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-black p-6 text-center">
      <div className="relative z-10 space-y-6">
        <div className="animate-bounce text-8xl">🎂</div>
        <h1 className="glow-gold font-dancing text-5xl font-bold text-bucin-gold md:text-7xl">
          Selamat Ulang Tahun, {activeBirthday.name}! 💖
        </h1>
        <p className="mx-auto max-w-md text-lg text-white/70 md:text-xl">
          Semoga hari ini penuh dengan cinta, tawa, dan kebahagiaan yang tak terhingga.
        </p>
        <div className="pt-8">
          <button
            onClick={() => setDismissed(true)}
            className="rounded-xl bg-bucin-gold px-5 py-2.5 font-semibold text-bucin-bg"
          >
            Lanjut ke halaman utama
          </button>
        </div>
      </div>
    </div>
  );
}
