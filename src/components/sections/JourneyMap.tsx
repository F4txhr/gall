'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';

type LocationPoint = {
  name: string;
  count: number;
  lastPhoto: string;
};

// --- PREMIUM LOCATION ICON ---
const MapPinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-bucin-gold mb-4"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
);

export function JourneyMap() {
  const [locations, setLocations] = useState<LocationPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocations = async () => {
      if (!supabase) return;
      const { data } = await supabase.from('memories').select('location, url').not('location', 'is', null);
      if (data) {
        const stats: Record<string, LocationPoint> = {};
        data.forEach(item => {
          if (!item.location || item.location.trim() === '') return;
          const loc = item.location.trim();
          if (!stats[loc]) stats[loc] = { name: loc, count: 0, lastPhoto: item.url };
          stats[loc].count += 1;
        });
        setLocations(Object.values(stats).sort((a, b) => b.count - a.count));
      }
      setLoading(false);
    };
    fetchLocations();
  }, []);

  if (loading || locations.length === 0) return null;

  return (
    <section className="max-w-6xl mx-auto py-10">
      <div className="text-center mb-10">
         <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Relationship Journey ✨</h2>
         <p className="text-zinc-500 text-[10px] mt-2 uppercase tracking-[0.4em]">Destinasi kenangan yang sudah kita jelajahi</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {locations.map((loc, idx) => (
          <motion.a
            key={loc.name}
            href={`https://www.google.com/maps/search/${encodeURIComponent(loc.name)}`}
            target="_blank"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="group relative overflow-hidden rounded-[2rem] bg-white/5 border border-white/10 p-6 hover:bg-white/10 transition-all shadow-xl"
          >
            <div className="relative z-10">
               <MapPinIcon />
               <div className="flex items-center gap-1.5 mb-2">
                  <span className="h-1 w-4 rounded-full bg-bucin-gold" />
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{loc.count} Moments</span>
               </div>
               <h4 className="text-white font-bold text-lg leading-tight group-hover:text-bucin-gold transition-colors">{loc.name}</h4>
            </div>
            
            {/* Background Image Preview */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-all duration-700">
               <img src={loc.lastPhoto} className="w-full h-full object-cover scale-150 group-hover:scale-100 transition-transform duration-1000" alt="" />
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
