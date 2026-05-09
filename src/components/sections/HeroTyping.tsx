'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

export function HeroTyping({ config }: { config?: any }) {
  const partnerA = config?.partnerA || '';
  const partnerB = config?.partnerB || '';
  const dbQuote = config?.quote || '';

  const [displayedA, setDisplayedA] = useState('');
  const [displayedB, setDisplayedB] = useState('');
  const [showHeart, setShowHeart] = useState(false);
  
  const [displayedQuote, setDisplayedQuote] = useState('');
  const [currentQuote, setCurrentQuote] = useState('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // 1. Jantung muncul saat nama ada
  useEffect(() => {
    if (partnerA && partnerB) {
      setTimeout(() => setShowHeart(true), 500);
    }
  }, [partnerA, partnerB]);

  // 2. Ketik Nama A
  useEffect(() => {
    if (!partnerA || !showHeart) return;
    let i = 0;
    setDisplayedA('');
    const timer = setInterval(() => {
      setDisplayedA(partnerA.slice(0, i));
      i++;
      if (i > partnerA.length) clearInterval(timer);
    }, 100);
    return () => clearInterval(timer);
  }, [showHeart, partnerA]);

  // 3. Ketik Nama B
  useEffect(() => {
    if (!partnerB || !partnerA || displayedA.length < partnerA.length) return;
    let i = 0;
    const delay = setTimeout(() => {
      const timer = setInterval(() => {
        setDisplayedB(partnerB.slice(0, i));
        i++;
        if (i > partnerB.length) clearInterval(timer);
      }, 100);
      return () => clearInterval(timer);
    }, 500);
    return () => clearTimeout(delay);
  }, [displayedA, partnerA, partnerB]);

  // 4. Fetch Quote AI (SEALU DINAMIS)
  useEffect(() => {
    const fetchAIQuote = async () => {
      // Jika di database tidak ada quote custom (masih default/kosong), panggil AI
      if (!dbQuote || dbQuote.includes('Setiap detik') || dbQuote === '') {
        setIsLoadingAi(true);
        try {
          const res = await fetch('/api/ai/quote', { 
            method: 'POST',
            cache: 'no-store' // Paksa ambil baru
          });
          const data = await res.json();
          if (data.ok) {
            setCurrentQuote(data.text);
          } else {
            setCurrentQuote(dbQuote || "Cinta kita abadi.");
          }
        } catch {
          setCurrentQuote(dbQuote);
        } finally {
          setIsLoadingAi(false);
        }
      } else {
        setCurrentQuote(dbQuote);
      }
    };

    if (partnerA && partnerB) fetchAIQuote();
  }, [dbQuote, partnerA, partnerB]);

  // 5. Ketik Quote
  useEffect(() => {
    if (!currentQuote || displayedB.length < partnerB.length) return;
    let i = 0;
    setDisplayedQuote('');
    const timer = setInterval(() => {
      setDisplayedQuote(currentQuote.slice(0, i));
      i++;
      if (i > currentQuote.length) clearInterval(timer);
    }, 40);
    return () => clearInterval(timer);
  }, [currentQuote, displayedB, partnerB]);

  if (!partnerA || !partnerB) {
    return (
      <section className="flex min-h-[70vh] items-center justify-center">
        <div className="h-8 w-48 animate-pulse rounded-full bg-white/5" />
      </section>
    );
  }

  return (
    <section className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <div className="relative flex flex-col items-center justify-center w-full max-w-2xl h-[300px] md:h-[400px]">
        
        <div className="absolute inset-0 flex items-center justify-center z-0 opacity-30 md:opacity-40">
           <AnimatePresence>
             {showHeart && (
               <motion.svg
                 viewBox="0 0 24 24"
                 fill="none"
                 stroke="currentColor"
                 strokeWidth="0.8"
                 className="w-64 h-64 md:w-[450px] md:h-[450px] text-bucin-pink drop-shadow-[0_0_20px_rgba(255,105,180,0.4)]"
                 initial={{ y: 100, opacity: 0, scale: 0.5 }}
                 animate={{ y: 0, opacity: 1, scale: 1 }}
                 transition={{ type: "spring", stiffness: 50, damping: 15 }}
               >
                 <motion.path
                   d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                   initial={{ pathLength: 0 }}
                   animate={{ pathLength: 1 }}
                   transition={{ duration: 3, ease: "easeInOut" }}
                 />
               </motion.svg>
             )}
           </AnimatePresence>
        </div>

        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
           <motion.h1 
            className="font-dancing glow-gold text-4xl md:text-8xl font-bold text-white self-center md:self-start md:ml-10 mb-2 md:-mb-4 whitespace-nowrap"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
           >
             {displayedA}
             {(displayedA.length > 0 && displayedA.length < partnerA.length) && <span className="animate-pulse font-sans ml-1 text-3xl md:text-5xl">|</span>}
           </motion.h1>

           <motion.h1 
            className="font-dancing glow-gold text-4xl md:text-8xl font-bold text-white self-center md:self-end md:mr-10 whitespace-nowrap"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
           >
             {displayedB}
             {(displayedB.length > 0 && displayedB.length < partnerB.length) && <span className="animate-pulse font-sans ml-1 text-3xl md:text-5xl">|</span>}
           </motion.h1>
        </div>
      </div>

      <div className="mt-12 max-w-2xl mx-auto min-h-[3rem] relative z-10 px-4">
        {isLoadingAi && !displayedQuote && (
            <p className="text-sm text-bucin-pink animate-pulse font-mono tracking-widest uppercase">Sedang menenun kata romantis...</p>
        )}
        <p className="text-lg italic text-bucin-textSecondary md:text-2xl font-serif leading-relaxed">
          {displayedQuote ? `“${displayedQuote}”` : (showHeart && displayedB.length === partnerB.length && !isLoadingAi ? '...' : '')}
        </p>
      </div>

      <motion.div
        className="mt-16 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <a href="#countdown" className="rounded-xl bg-bucin-gold px-10 py-4 font-bold text-bucin-bg shadow-lg shadow-bucin-gold/10 hover:scale-110 transition-transform active:scale-95 text-sm uppercase tracking-widest">
          Momen Mendatang ➔
        </a>
      </motion.div>
    </section>
  );
}
