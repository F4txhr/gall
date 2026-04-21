'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { relationshipConfig } from '@/lib/relationship';
import { MemoryUpload } from './MemoryUpload';
import { DateIdeaGenerator } from './DateIdeaGenerator';

type RoleDashboardProps = {
  role: 'cowo' | 'cewe';
};

export function RoleDashboard({ role }: RoleDashboardProps): JSX.Element {
  const router = useRouter();
  const [partnerOnline, setPartnerOnline] = useState(false);
  const [myLocation, setMyLocation] = useState('');
  const [savingLocation, setSavingLocation] = useState(false);
  const [checking, setChecking] = useState(true);
  const [globalLayout, setGlobalLayout] = useState<'scrapbook' | 'museum' | 'deck'>('scrapbook');

  const myName = role === 'cowo' ? relationshipConfig.partnerA : relationshipConfig.partnerB;
  const partnerName = role === 'cowo' ? relationshipConfig.partnerB : relationshipConfig.partnerA;

  useEffect(() => {
    if (!supabase) return;

    const fetchMySettings = async () => {
      const { data } = await supabase.from('settings').select('key, value');
      
      const locKey = role === 'cowo' ? 'partner_a_location' : 'partner_b_location';
      const loc = data?.find(i => i.key === locKey)?.value;
      if (loc) setMyLocation(loc);

      const lay = data?.find(i => i.key === 'gallery_layout')?.value;
      if (lay) setGlobalLayout(lay as any);

      setChecking(false);
    };
    fetchMySettings();

    const channel = supabase.channel('online_presence', {
      config: { presence: { key: role } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const partnerRole = role === 'cowo' ? 'cewe' : 'cowo';
        setPartnerOnline(!!state[partnerRole]);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ online_at: new Date().toISOString(), user: myName });
        }
      });

    return () => { channel.unsubscribe(); };
  }, [role, myName]);

  const logout = async (): Promise<void> => {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const saveLocation = async () => {
    if (!supabase || !myLocation.trim()) return;
    setSavingLocation(true);
    const key = role === 'cowo' ? 'partner_a_location' : 'partner_b_location';
    await supabase.from('settings').upsert({ key, value: myLocation, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    setSavingLocation(false);
    alert('Lokasi berhasil disimpan! ✨');
  };

  const saveLayout = async (newLayout: string) => {
    if (!supabase) return;
    setGlobalLayout(newLayout as any);
    await supabase.from('settings').upsert({ key: 'gallery_layout', value: newLayout, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  };

  if (checking) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-bucin-bg">
        <div className="text-center"><div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-bucin-gold border-t-transparent mb-4"></div></div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen bg-bucin-bg px-4 py-12 text-bucin-text">
      <section className="mx-auto w-full max-w-xl rounded-3xl border border-bucin-gold/20 bg-gradient-to-b from-[#4A4A4A] to-[#3d3d3d] p-8 md:p-10 shadow-2xl text-center">
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-4xl font-bold">Halo, {myName} 💛</h1>
          
          <div className="mt-8 w-full border-t border-white/5 pt-8 space-y-10 text-left">
            {/* Setting: Lokasi */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-bucin-gold">📍 Domisili Kota</h3>
              <div className="flex gap-2">
                <input type="text" className="w-full rounded-xl bg-white/5 border border-white/10 p-3 text-sm text-white outline-none focus:border-bucin-gold" value={myLocation} onChange={(e) => setMyLocation(e.target.value)} />
                <button onClick={saveLocation} disabled={savingLocation} className="rounded-xl bg-bucin-gold px-5 py-2 text-xs font-bold text-bucin-bg hover:bg-bucin-hover transition-all">{savingLocation ? '...' : 'Set'}</button>
              </div>
            </div>

            {/* Setting: Layout */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-bucin-gold">🎞️ Tema Galeri</h3>
              <div className="grid grid-cols-3 gap-2">
                {['scrapbook', 'museum', 'deck'].map((l) => (
                  <button key={l} onClick={() => saveLayout(l)} className={`rounded-xl border p-3 text-[9px] font-bold uppercase tracking-wider transition-all ${globalLayout === l ? 'bg-bucin-gold border-bucin-gold text-bucin-bg' : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'}`}>{l}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/5 pt-8">
          <button onClick={() => router.push('/')} className="w-full rounded-xl bg-bucin-pink py-4 font-bold text-white hover:bg-bucin-pink/80 shadow-lg shadow-bucin-pink/20 transition-all">Masuk ke Halaman Utama ➔</button>
          <button onClick={logout} className="text-xs text-white/20 hover:text-red-400 underline transition-colors">Logout Sesi</button>
        </div>
      </section>
    </main>
  );
}
