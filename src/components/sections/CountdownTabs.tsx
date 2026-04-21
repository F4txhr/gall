'use client';

import { useEffect, useState } from 'react';
import { relationshipConfig } from '@/lib/relationship';

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function getTimeLeft(targetDate: string): TimeLeft {
  const now = new Date().getTime();
  const target = new Date(targetDate).getTime();
  const diff = Math.max(0, target - now);

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

function CompactCard({ title, date, label }: { title: string; date: string; label: string }) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(getTimeLeft(date));

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeLeft(date)), 1000);
    return () => clearInterval(timer);
  }, [date]);

  const formattedDate = new Date(date).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="flex flex-col rounded-2xl border border-white/5 bg-white/[0.03] p-5 transition-all hover:bg-white/[0.06]">
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-bucin-gold/60">{label}</span>
      <h3 className="mt-1 text-lg font-bold text-white">{title}</h3>
      <p className="mt-1 text-[11px] text-bucin-textSecondary">Target: {formattedDate}</p>
      
      <div className="mt-4 flex items-baseline gap-1 font-mono">
        <span className="text-2xl font-bold text-bucin-pink">{timeLeft.days}</span>
        <span className="text-[10px] text-bucin-textSecondary mr-2">h</span>
        <span className="text-2xl font-bold text-bucin-pink">{timeLeft.hours}</span>
        <span className="text-[10px] text-bucin-textSecondary mr-2">j</span>
        <span className="text-2xl font-bold text-bucin-pink">{timeLeft.minutes}</span>
        <span className="text-[10px] text-bucin-textSecondary mr-2">m</span>
        <span className="text-2xl font-bold text-bucin-pink">{timeLeft.seconds}</span>
        <span className="text-[10px] text-bucin-textSecondary">d</span>
      </div>
    </div>
  );
}

export function CountdownTabs({ config }: { config?: any }): JSX.Element {
  const settings = config || relationshipConfig;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <CompactCard 
        label="Anniversary" 
        title="Hari Jadi Kita" 
        date={settings.anniversaryDate} 
      />
      <CompactCard 
        label="Ulang Tahun" 
        title={`Ultah ${settings.partnerA}`} 
        date={settings.birthdayCowoDate} 
      />
      <CompactCard 
        label="Ulang Tahun" 
        title={`Ultah ${settings.partnerB}`} 
        date={settings.birthdayCeweDate} 
      />
    </div>
  );
}
