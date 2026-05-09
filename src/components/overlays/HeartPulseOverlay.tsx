'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';

export function HeartPulseOverlay() {
  const [showHearts, setShowHearts] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/me').then(res => res.json()).then(data => setUserRole(data.role));

    if (!supabase) return;

    const channel = supabase.channel('pokes');
    channel
      .on('broadcast', { event: 'kangen_pulse' }, ({ payload }) => {
        // Hanya munculkan di layar penerima (bukan pengirim)
        if (payload.from !== userRole) {
          setShowHearts(true);
          // Berikan getaran jika di HP
          if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
          
          setTimeout(() => setShowHearts(false), 5000);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userRole]);

  return (
    <AnimatePresence>
      {showHearts && (
        <div className="fixed inset-0 z-[1000] pointer-events-none overflow-hidden">
          {/* Efek Redup Layar */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-pink-500/10 backdrop-blur-[2px]"
          />
          
          {/* Hujan Hati */}
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: -100, x: Math.random() * 100 + 'vw', scale: 0, opacity: 0 }}
              animate={{ 
                y: '110vh', 
                scale: [0, 1.5, 1], 
                opacity: [0, 1, 0],
                rotate: Math.random() * 360 
              }}
              transition={{ 
                duration: 2 + Math.random() * 3, 
                delay: Math.random() * 1.5,
                ease: "linear"
              }}
              className="absolute text-4xl"
            >
              {['❤️', '💖', '💕', '💗'][Math.floor(Math.random() * 4)]}
            </motion.div>
          ))}

          {/* Pesan Tengah */}
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center"
          >
             <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-8 py-4 shadow-2xl">
                <p className="text-white font-black italic tracking-widest text-lg animate-pulse">PASANGANMU LAGI KANGEN! ❤️</p>
             </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
