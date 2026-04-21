'use client';

import { useState, useEffect } from 'react';
import { BirthdayFullscreen } from '@/components/overlays/BirthdayFullscreen';
import { CelebrationFlow } from '@/components/sections/CelebrationFlow';
import { CountdownTabs } from '@/components/sections/CountdownTabs';
import { HeroTyping } from '@/components/sections/HeroTyping';
import { LoveCounter } from '@/components/sections/LoveCounter';
import { MemoryWall } from '@/components/sections/MemoryWall';
import { MemoryUpload } from '@/components/sections/MemoryUpload';
import { DateIdeaGenerator } from '@/components/sections/DateIdeaGenerator';
import { DateWishlist } from '@/components/sections/DateWishlist';

export default function Home(): JSX.Element {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [liveSettings, setLiveSettings] = useState<any>(null);

  useEffect(() => {
    fetch('/api/me')
      .then(res => res.json())
      .then(data => {
        setUserRole(data.role);
        if (data.settings) setLiveSettings(data.settings);
      });
  }, []);

  return (
    <div className="space-y-6 pb-20">
      {/* Celebration Mode */}
      <CelebrationFlow config={liveSettings} />
      
      <BirthdayFullscreen />
      
      <section className="relative">
        <HeroTyping config={liveSettings} />
      </section>

      {userRole && (
        <section className="relative z-10 mx-auto max-w-4xl px-6">
          <div className="card-bucin bg-bucin-gold/5 border-bucin-gold/20 p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <h3 className="text-xl font-bold text-white mb-1">Bucin Center ✨</h3>
                <p className="text-xs text-bucin-textSecondary">Kelola kenangan dan cari ide kencan di sini.</p>
              </div>
              <div className="flex flex-wrap justify-center gap-4">
                <MemoryUpload />
                <DateIdeaGenerator />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Love Counter Section */}
      <section className="flex justify-center px-6">
        <div className="card-bucin p-6 md:p-8 text-center w-full max-w-2xl">
          <p className="glow-pink mb-4 text-[10px] font-bold uppercase tracking-[0.5em] text-bucin-pink">
            Detik-detik Bersamamu ✨
          </p>
          <LoveCounter config={liveSettings} />
        </div>
      </section>

      {/* Countdown Section */}
      <section id="countdown" className="flex justify-center px-6">
        <div className="card-bucin p-6 md:p-8 w-full max-w-3xl">
           <h2 className="glow-gold mb-6 text-center text-xl font-bold text-bucin-gold tracking-tight">
             Momen Spesial Selanjutnya 💖
           </h2>
           <CountdownTabs config={liveSettings} />
        </div>
      </section>

      <DateWishlist userRole={userRole} />

      <MemoryWall initialLayout={liveSettings?.galleryLayout} />
    </div>
  );
}
