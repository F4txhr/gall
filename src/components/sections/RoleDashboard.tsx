'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { relationshipConfig } from '@/lib/relationship';

type RoleDashboardProps = {
  role: 'cowo' | 'cewe';
};

export function RoleDashboard({ role }: RoleDashboardProps): JSX.Element {
  const router = useRouter();
  const [partnerOnline, setPartnerOnline] = useState(false);
  
  const myName = role === 'cowo' ? relationshipConfig.partnerA : relationshipConfig.partnerB;
  const partnerName = role === 'cowo' ? relationshipConfig.partnerB : relationshipConfig.partnerA;

  useEffect(() => {
    if (!supabase) return;

    // Presence Channel setup
    const channel = supabase.channel('online_presence', {
      config: {
        presence: {
          key: role,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const partnerRole = role === 'cowo' ? 'cewe' : 'cowo';
        // Check if partner's role key exists in presence state
        setPartnerOnline(!!state[partnerRole]);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            online_at: new Date().toISOString(),
            user: myName,
          });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [role, myName]);

  const logout = async (): Promise<void> => {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <main className="flex min-h-[60vh] items-center justify-center bg-bucin-bg px-4 py-12 text-bucin-text">
      <section className="w-full max-w-xl rounded-3xl border border-bucin-gold/20 bg-gradient-to-b from-[#4A4A4A] to-[#3d3d3d] p-10 shadow-2xl text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
             <h1 className="text-4xl font-bold md:text-5xl">Halo, {myName} 💛</h1>
             
             {/* Breathing Presence Indicator */}
             {partnerOnline && (
               <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full bg-bucin-gold/10 px-4 py-1.5 border border-bucin-gold/40 animate-breath backdrop-blur-sm">
                 <span className="relative flex h-2.5 w-2.5">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-bucin-gold opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-bucin-gold"></span>
                 </span>
                 <span className="text-[11px] uppercase tracking-[0.2em] text-bucin-gold font-bold">
                   {partnerName} sedang Online
                 </span>
               </div>
             )}
          </div>

          <p className="mt-4 text-bucin-textSecondary leading-relaxed">
            Senang melihatmu kembali. Semua kenangan dan kejutan spesial untukmu sudah siap di halaman utama.
          </p>
          
          {partnerOnline && (
            <p className="text-sm italic text-bucin-gold/80 animate-pulse mt-2">
              “Ssstt... {partnerName} juga sedang membuka web ini sekarang! ✨”
            </p>
          )}
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="rounded-xl border border-bucin-gold px-6 py-3 font-semibold text-bucin-text transition-all hover:bg-bucin-gold hover:text-bucin-bg active:scale-95 shadow-lg shadow-bucin-gold/5"
          >
            Lihat Kejutan Kita
          </button>
          <button
            type="button"
            onClick={logout}
            className="rounded-xl bg-bucin-card px-6 py-3 font-semibold text-bucin-textSecondary transition-all hover:bg-red-900/20 hover:text-red-400 border border-transparent hover:border-red-900/30"
          >
            Logout
          </button>
        </div>
      </section>
    </main>
  );
}
