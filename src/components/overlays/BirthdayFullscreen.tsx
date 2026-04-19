'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { relationshipConfig } from '@/lib/relationship';

type BirthdayTarget = {
  key: 'cowo' | 'cewe';
  name: string;
  date: string;
};

type Props = {
  force?: boolean;
};

function isTodayBirthday(dateIso: string): boolean {
  const now = new Date();
  const target = new Date(dateIso);
  return now.getDate() === target.getDate() && now.getMonth() === target.getMonth();
}

export function BirthdayFullscreen({ force = false }: Props): JSX.Element | null {
  const [dismissed, setDismissed] = useState(false);
  const params = useSearchParams();
  const forcedByQuery = params.get('birthday') === '1';

  const activeBirthday = useMemo(() => {
    const list: BirthdayTarget[] = [
      {
        key: 'cowo',
        name: relationshipConfig.partnerA,
        date: relationshipConfig.birthdayCowoDate,
      },
      {
        key: 'cewe',
        name: relationshipConfig.partnerB,
        date: relationshipConfig.birthdayCeweDate,
      },
    ];

    return list.find((item) => isTodayBirthday(item.date)) ?? list[0];
  }, []);

  const shouldShow = force || forcedByQuery || isTodayBirthday(relationshipConfig.birthdayCowoDate) || isTodayBirthday(relationshipConfig.birthdayCeweDate);

  if (!shouldShow || dismissed || !activeBirthday) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex min-h-screen w-full items-center justify-center bg-gradient-to-b from-[#1B3A4B] via-[#2D2D2D] to-[#4A4A4A] p-6 text-center text-bucin-text">
      <div className="w-full max-w-2xl rounded-3xl border border-bucin-gold/50 bg-black/20 p-8 shadow-2xl backdrop-blur-sm">
        <p className="text-sm uppercase tracking-[0.3em] text-bucin-gold">Birthday Mode</p>
        <h1 className="mt-4 text-4xl font-bold md:text-6xl">Happy Birthday, {activeBirthday.name}! 🎉</h1>
        <p className="mt-5 text-bucin-textSecondary md:text-lg">
          Mode ini full-screen. Bisa dites kapan saja lewat <span className="font-semibold text-bucin-gold">/?birthday=1</span> atau <span className="font-semibold text-bucin-gold">/birthday</span>.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
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
