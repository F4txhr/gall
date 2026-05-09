'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const Icons = {
  Home: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  ),
  Booth: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
  ),
  Journal: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
  ),
  Wish: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
  ),
  Heart: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
  ),
  Logout: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
  )
};

export function Navbar() {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isPoking, setIsPoking] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/me').then(res => res.json()).then(data => setUserRole(data.role));
  }, []);

  const handlePoke = async () => {
    if (!userRole || isPoking) return;
    setIsPoking(true);
    const channel = supabase?.channel('pokes');
    await channel?.send({ type: 'broadcast', event: 'kangen_pulse', payload: { from: userRole } });
    fetch('/api/celebrate/notify', { method: 'POST', body: JSON.stringify({ action: 'poke', senderRole: userRole }) });
    setTimeout(() => setIsPoking(false), 3000);
  };

  const navItems = [
    { id: 'home', label: 'Home', path: '/', Icon: Icons.Home },
    { id: 'journal', label: 'Journal', path: '/journal', Icon: Icons.Journal },
    { id: 'booth', label: 'Booth', path: '/booth', Icon: Icons.Booth },
    { id: 'wish', label: 'Wish', path: '#countdown', Icon: Icons.Wish },
  ];

  if (pathname === '/login' || pathname === '/booth' || pathname === '/journal') return null;

  return (
    <nav className="fixed bottom-8 left-1/2 z-[400] -translate-x-1/2">
      <motion.div 
        layout
        className="flex items-center gap-3 rounded-full border border-white/10 bg-black/40 p-2.5 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
      >
        {navItems.map((item) => (
          <Link key={item.id} href={item.path} onMouseEnter={() => setHoveredItem(item.id)} onMouseLeave={() => setHoveredItem(null)}>
            <motion.div
              layout
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className={`relative flex items-center h-12 gap-2 px-3 rounded-full overflow-hidden transition-colors ${
                pathname === item.path ? 'bg-bucin-gold text-bucin-bg shadow-lg' : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.Icon />
              <AnimatePresence>
                {hoveredItem === item.id && (
                  <motion.span
                    initial={{ width: 0, opacity: 0 }} animate={{ width: 'auto', opacity: 1 }} exit={{ width: 0, opacity: 0 }}
                    className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          </Link>
        ))}

        {userRole && (
          <motion.button
            onMouseEnter={() => setHoveredItem('poke')} onMouseLeave={() => setHoveredItem(null)}
            onClick={handlePoke} disabled={isPoking} layout
            className={`flex items-center h-12 gap-2 px-3 rounded-full transition-all ${
              isPoking ? 'bg-pink-600 text-white shadow-pink-600/50' : 'bg-white/5 text-pink-500 hover:bg-pink-500/20'
            }`}
          >
            <Icons.Heart />
            <AnimatePresence>
              {hoveredItem === 'poke' && (
                <motion.span
                  initial={{ width: 0, opacity: 0 }} animate={{ width: 'auto', opacity: 1 }} exit={{ opacity: 0, scale: 0.5 }}
                  className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap"
                >
                  {isPoking ? 'Sending...' : 'Kangen'}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        )}

        <a href="/api/logout" onMouseEnter={() => setHoveredItem('logout')} onMouseLeave={() => setHoveredItem(null)}>
          <motion.div layout className="flex items-center h-12 gap-2 px-3 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20">
            <Icons.Logout />
            <AnimatePresence>
              {hoveredItem === 'logout' && (
                <motion.span
                  initial={{ width: 0, opacity: 0 }} animate={{ width: 'auto', opacity: 1 }} exit={{ opacity: 0, scale: 0.5 }}
                  className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap"
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        </a>
      </motion.div>
    </nav>
  );
}
