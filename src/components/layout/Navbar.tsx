'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { relationshipConfig } from '@/lib/relationship';

export function Navbar(): JSX.Element {
  const [partnerOnline, setPartnerOnline] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    const checkOverlays = () => {
      setIsHidden(document.body.style.overflow === 'hidden');
    };
    const observer = new MutationObserver(checkOverlays);
    observer.observe(document.body, { attributes: true, attributeFilter: ['style'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!supabase) return;

    fetch('/api/me')
      .then(res => res.json())
      .then(data => {
        if (data.role) setUserRole(data.role);
      });

    const channel = supabase.channel('presence_nav');

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const partnerRole = userRole === 'cowo' ? 'cewe' : 'cowo';
        const isOnline = Object.values(state).some((presences: any) => 
          presences.some((p: any) => p.role === partnerRole)
        );
        setPartnerOnline(isOnline);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED' && userRole) {
          await channel.track({ role: userRole });
        }
      });

    return () => { channel.unsubscribe(); };
  }, [userRole]);

  const partnerDisplayName = userRole === 'cowo' ? relationshipConfig.partnerB : relationshipConfig.partnerA;

  return (
    <header className={`sticky top-0 z-[100] border-b border-white/10 bg-[#1f1f1f]/70 backdrop-blur-md transition-transform duration-300 ${isHidden ? '-translate-y-full' : 'translate-y-0'}`}>
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-lg font-semibold text-bucin-text">
            Web Bucin
          </Link>
          
          {userRole && (
            <div className="flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-wider">
              <span className="relative flex h-2 w-2">
                {partnerOnline && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                )}
                <span className={`relative inline-flex h-2 w-2 rounded-full ${partnerOnline ? 'bg-green-500' : 'bg-gray-500'}`}></span>
              </span>
              <span className={partnerOnline ? 'text-green-400 font-medium' : 'text-gray-400'}>
                {partnerDisplayName} {partnerOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 md:gap-4">
          <a href="#counter" className="rounded-lg px-2 py-2 text-sm text-bucin-textSecondary transition hover:bg-white/5 hover:text-bucin-text md:px-3">
            Counter
          </a>
          <a href="#countdown" className="rounded-lg px-2 py-2 text-sm text-bucin-textSecondary transition hover:bg-white/5 hover:text-bucin-text md:px-3">
            Countdown
          </a>
          <a href="#memories" className="rounded-lg px-2 py-2 text-sm text-bucin-textSecondary transition hover:bg-white/5 hover:text-bucin-text md:px-3">
            Gallery
          </a>
          <a href="#wishlist" className="rounded-lg px-2 py-2 text-sm text-bucin-textSecondary transition hover:bg-white/5 hover:text-bucin-text md:px-3">
            Wishlist
          </a>
          <div className="ml-2 h-4 w-[1px] bg-white/10 md:ml-4"></div>
          {userRole ? (
            <button 
              onClick={async () => {
                await fetch('/api/logout', { method: 'POST' });
                window.location.href = '/login';
              }}
              className="ml-2 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-2 text-sm font-bold text-red-400 transition hover:bg-red-500/20 active:scale-95 md:ml-4 md:px-5"
            >
              Logout
            </button>
          ) : (
            <Link href="/login" className="ml-2 rounded-xl bg-bucin-gold px-4 py-2 text-sm font-bold text-bucin-bg transition hover:scale-105 hover:bg-bucin-hover active:scale-95 md:ml-4 md:px-5">
              Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
