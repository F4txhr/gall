'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';

export function RelationshipWrapped() {
  const [stats, setStats] = useState({
    totalMemories: 0,
    topLocation: '-',
    visitStreak: 0,
    monthName: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!supabase) return;
      const { count: memCount } = await supabase.from('memories').select('*', { count: 'exact', head: true });
      const { data: locData } = await supabase.from('memories').select('location');
      const locMap: Record<string, number> = {};
      locData?.forEach(i => {
        if (i.location) locMap[i.location] = (locMap[i.location] || 0) + 1;
      });
      const topLoc = Object.entries(locMap).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown';
      const { data: sData } = await supabase.from('settings').select('key, value').in('key', ['cewe_visit_count']);
      const visitCount = sData?.find(s => s.key === 'cewe_visit_count')?.value || '0';
      const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
      
      setStats({
        totalMemories: memCount || 0,
        topLocation: topLoc,
        visitStreak: parseInt(visitCount),
        monthName: months[new Date().getMonth()]
      });
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) return null;

  return (
    <section className="max-w-6xl mx-auto px-6 py-10">
      <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-pink-600/20 to-bucin-gold/10 border border-white/10 p-8 md:p-12 shadow-2xl">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-pink-500/10 blur-[80px]" />
        
        <div className="relative z-10 flex flex-col items-center text-center">
            <div className="mb-10">
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-pink-500">Monthly Recap</span>
              <h2 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter mt-2 leading-none uppercase">
                {stats.monthName}<br /><span className="text-bucin-gold">Wrapped ✨</span>
              </h2>
            </div>

            {/* Grid Statistik - Selalu Center di Mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-4xl">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/5 backdrop-blur-md rounded-[2rem] p-6 border border-white/10 flex flex-col items-center justify-center min-h-[140px]">
                <p className="text-4xl font-black text-white mb-1">{stats.totalMemories}</p>
                <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Kenangan Dibuat</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-pink-600/10 backdrop-blur-md rounded-[2rem] p-6 border border-pink-500/20 flex flex-col items-center justify-center min-h-[140px]">
                <div className="w-full">
                    <p className="text-xl md:text-2xl font-black text-white truncate px-2 text-center uppercase tracking-tight">
                        {stats.topLocation}
                    </p>
                </div>
                <p className="text-[9px] font-bold text-pink-500 uppercase tracking-widest mt-2">Tempat Favorit 📍</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white/5 backdrop-blur-md rounded-[2rem] p-6 border border-white/10 flex flex-col items-center justify-center min-h-[140px]">
                <p className="text-4xl font-black text-bucin-gold mb-1">{stats.visitStreak}</p>
                <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Hari Berkunjung</p>
              </motion.div>
            </div>
        </div>
      </div>
    </section>
  );
}
