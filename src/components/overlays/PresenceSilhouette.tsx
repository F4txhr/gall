'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

// --- CUSTOM LINE-ART SILHOUETTES ---
const Silhouettes = {
  cowo: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  ),
  cewe: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM3.75 21.75c0-2.485 2.015-4.5 4.5-4.5h7.5c2.485 0 4.5 2.015 4.5 4.5v0H3.75Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v-1.5a3 3 0 0 1 3-3v0a3 3 0 0 1 3 3v1.5" />
    </svg>
  )
};

export function PresenceSilhouette() {
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [partnerName, setPartnerName] = useState('');

  useEffect(() => {
    fetch('/api/me').then(res => res.json()).then(data => {
        setUserRole(data.role);
        setPartnerName(data.role === 'cowo' ? (data.settings?.partnerB || 'Dia') : (data.settings?.partnerA || 'Kamu'));
    });

    if (!supabase) return;
    const channel = supabase.channel('presence-global');

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users = Object.values(state).flat();
        setOnlineUsers(users);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const partnerRole = userRole === 'cowo' ? 'cewe' : 'cowo';
  const isPartnerOnline = onlineUsers.some(u => u.role === partnerRole);

  return (
    <AnimatePresence>
      {isPartnerOnline && (
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          className="fixed bottom-32 right-6 z-[350] flex flex-col items-center group"
        >
          {/* Glowing Aura */}
          <div className={`absolute inset-0 blur-2xl rounded-full opacity-20 animate-pulse ${userRole === 'cowo' ? 'bg-pink-500' : 'bg-bucin-gold'}`} />
          
          <div className="relative flex flex-col items-center">
            {/* Label Nama (Elegant Floating) */}
            <motion.span 
                initial={{ opacity: 0, y: 10 }}
                whileHover={{ opacity: 1, y: 0 }}
                className="absolute -top-8 bg-black/60 backdrop-blur-md text-[9px] font-black uppercase tracking-[0.2em] text-white px-3 py-1 rounded-full border border-white/10 whitespace-nowrap pointer-events-none"
            >
                {partnerName} is here
            </motion.span>

            {/* Silhouette Frame */}
            <div className={`p-4 rounded-full border backdrop-blur-xl shadow-2xl transition-colors duration-1000 ${userRole === 'cowo' ? 'border-pink-500/30 text-pink-500 bg-pink-500/5' : 'border-bucin-gold/30 text-bucin-gold bg-bucin-gold/5'}`}>
              {userRole === 'cowo' ? <Silhouettes.cewe /> : <Silhouettes.cowo />}
            </div>
            
            {/* Status Dot */}
            <div className="mt-2 flex items-center gap-1.5">
               <span className="h-1 w-1 rounded-full bg-green-500 animate-ping" />
               <span className="text-[8px] font-bold text-green-500 uppercase tracking-widest">Watching</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
