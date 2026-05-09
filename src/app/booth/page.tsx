'use client';

import { useState, useEffect, Suspense } from 'react';
import { Photobooth } from '@/components/sections/Photobooth';
import Link from 'next/link';

export default function BoothPage() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [partnerName, setPartnerName] = useState('Partner');

  useEffect(() => {
    fetch('/api/me')
      .then(res => res.json())
      .then(data => {
        setUserRole(data.role);
        if (data.settings) {
          const name = data.role === 'cowo' ? data.settings.partnerB : data.settings.partnerA;
          setPartnerName(name);
        }
      });
  }, []);

  return (
    <main className="min-h-screen bg-zinc-950">
      {/* Tombol Back ke Home */}
      <div className="fixed top-6 left-6 z-[700]">
        <Link 
          href="/" 
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all"
        >
          ✕
        </Link>
      </div>

      <Suspense fallback={null}>
        <Photobooth userRole={userRole} partnerName={partnerName} isFullPage={true} />
      </Suspense>
    </main>
  );
}
