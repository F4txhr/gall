'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

export function OnlineIndicator() {
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [partnerName, setPartnerName] = useState('Partner');

  useEffect(() => {
    fetch('/api/me')
      .then(res => res.json())
      .then(data => {
        setUserRole(data.role);
        setPartnerName(data.role === 'cowo' ? (data.settings?.partnerB || 'Dia') : (data.settings?.partnerA || 'Kamu'));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!supabase || !userRole) return;

    const sessionUniqueId = Math.random().toString(36).substring(7);
    const channel = supabase.channel(`status_${userRole}_${sessionUniqueId}`, {
      config: { presence: { key: userRole } }
    });

    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      const roles = Object.values(state).flat().map((p: any) => p.role);
      setOnlineUsers(roles);
    });

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({ role: userRole, online_at: new Date().toISOString() });
      }
    });

    return () => {
      channel.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [userRole]);

  const partnerRole = userRole === 'cowo' ? 'cewe' : 'cowo';
  const isPartnerOnline = onlineUsers.includes(partnerRole);

  return (
    <div className="fixed top-4 right-4 z-[450]">
      <AnimatePresence>
        <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-md shadow-lg transition-all duration-500 ${
                isPartnerOnline ? 'bg-green-500/10 border-green-500/20' : 'bg-black/20 border-white/5'
            }`}
        >
          {/* Minimalist Dot */}
          <div className="relative flex h-2 w-2">
             {isPartnerOnline && (
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
             )}
             <span className={`relative inline-flex rounded-full h-2 w-2 ${isPartnerOnline ? 'bg-green-500' : 'bg-zinc-600'}`}></span>
          </div>
          
          <span className={`text-[10px] font-bold tracking-tight ${isPartnerOnline ? 'text-white' : 'text-zinc-500'}`}>
             {partnerName}
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
