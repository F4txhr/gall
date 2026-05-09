'use client';

import { useState, useEffect, Suspense } from 'react';
import { BirthdayFullscreen } from '@/components/overlays/BirthdayFullscreen';
import { CelebrationFlow } from '@/components/sections/CelebrationFlow';
import { CountdownTabs } from '@/components/sections/CountdownTabs';
import { HeroTyping } from '@/components/sections/HeroTyping';
import { LoveCounter } from '@/components/sections/LoveCounter';
import { MemoryWall } from '@/components/sections/MemoryWall';
import { MemoryUpload } from '@/components/sections/MemoryUpload';
import { DateIdeaGenerator } from '@/components/sections/DateIdeaGenerator';
import { DateWishlist } from '@/components/sections/DateWishlist';
import { OnlineIndicator } from '@/components/layout/OnlineIndicator';
import { DailyNotes } from '@/components/sections/DailyNotes';
import { JourneyMap } from '@/components/sections/JourneyMap';
import { RelationshipWrapped } from '@/components/sections/RelationshipWrapped';
import Link from 'next/link';

const CACHE_KEY = 'wb_live_settings';

const Icons = {
  Booth: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
  )
};

export default function Home() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [liveSettings, setLiveSettings] = useState<any>(null);

  useEffect(() => {
    const savedCache = localStorage.getItem(CACHE_KEY);
    if (savedCache) { try { setLiveSettings(JSON.parse(savedCache)); } catch (e) { } }
    const syncData = async () => {
      try {
        const res = await fetch('/api/me');
        const data = await res.json();
        setUserRole(data.role);
        if (data.settings) {
          setLiveSettings(data.settings);
          localStorage.setItem(CACHE_KEY, JSON.stringify(data.settings));
          if (data.role === 'cewe') await fetch('/api/track/cewe', { method: 'POST' });
        }
      } catch (err) { }
    };
    syncData();
  }, []);

  const partnerName = userRole === 'cowo' ? (liveSettings?.partnerB || 'Dia') : (liveSettings?.partnerA || 'Kamu');

  return (
    <div className="space-y-10 pb-32">
      <OnlineIndicator />
      
      <Suspense fallback={null}><CelebrationFlow config={liveSettings} /></Suspense>
      <Suspense fallback={null}><BirthdayFullscreen config={liveSettings} /></Suspense>
      
      <section className="relative"><HeroTyping config={liveSettings} /></section>

      {userRole && (
        <div className="max-w-6xl mx-auto px-6 space-y-10">
          <DailyNotes userRole={userRole} partnerName={partnerName} />

          <section className="relative z-10">
            <div className="card-bucin bg-bucin-gold/5 border-bucin-gold/20 p-6 md:p-8 rounded-[2.5rem]">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <h3 className="text-xl font-bold text-white mb-1">Bucin Center ✨</h3>
                  <p className="text-xs text-zinc-500">Kelola kenangan dan cari ide kencan di sini.</p>
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                  <Link href="/booth" className="flex items-center rounded-xl bg-pink-600/10 border border-pink-500/30 px-6 py-3 font-bold text-pink-500 hover:bg-pink-600/20 transition-all text-sm shadow-lg shadow-pink-600/5"><Icons.Booth /> Bucin Booth</Link>
                  <MemoryUpload />
                  <DateIdeaGenerator />
                </div>
              </div>
            </div>
          </section>

          <JourneyMap />
        </div>
      )}

      <section className="flex justify-center px-6">
        <div className="card-bucin p-6 md:p-8 text-center w-full max-w-2xl">
          <p className="glow-pink mb-4 text-[10px] font-bold uppercase tracking-[0.5em] text-bucin-pink">Detik-detik Bersamamu ✨</p>
          <LoveCounter config={liveSettings} />
        </div>
      </section>

      <section id="countdown" className="flex justify-center px-6">
        <div className="card-bucin p-6 md:p-8 w-full max-w-3xl">
           <h2 className="glow-gold mb-6 text-center text-xl font-bold text-bucin-gold tracking-tight">Momen Spesial Selanjutnya 💖</h2>
           <CountdownTabs config={liveSettings} />
        </div>
      </section>

      <RelationshipWrapped />

      <DateWishlist userRole={userRole} />
      <MemoryWall initialLayout={liveSettings?.galleryLayout} />
    </div>
  );
}
