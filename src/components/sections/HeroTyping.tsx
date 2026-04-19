'use client';

import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { relationshipConfig } from '@/lib/relationship';

export function HeroTyping(): JSX.Element {
  const titleText = useMemo(
    () => `${relationshipConfig.partnerA} ❤️ ${relationshipConfig.partnerB}`,
    []
  );
  const [typed, setTyped] = useState('');
  const [quote, setQuote] = useState(relationshipConfig.quote);

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      index += 1;
      setTyped(titleText.slice(0, index));
      if (index >= titleText.length) {
        clearInterval(timer);
      }
    }, 90);

    return () => clearInterval(timer);
  }, [titleText]);

  useEffect(() => {
    const run = async (): Promise<void> => {
      const res = await fetch('/api/ai/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnerA: relationshipConfig.partnerA,
          partnerB: relationshipConfig.partnerB,
        }),
      });

      if (!res.ok) return;
      const data = (await res.json()) as { quote?: string };
      if (data.quote) setQuote(data.quote);
    };

    run();
  }, []);

  return (
    <section className="mx-auto flex min-h-[88vh] w-full max-w-6xl flex-col items-center justify-center px-6 text-center">
      <motion.p
        className="rounded-full border border-bucin-gold/40 bg-bucin-gold/10 px-4 py-1 text-xs uppercase tracking-[0.2em] text-bucin-gold"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Anniversary Vault
      </motion.p>

      <h1 className="mt-6 text-4xl font-bold md:text-6xl">{typed}</h1>

      <motion.p
        className="mt-6 max-w-2xl text-bucin-textSecondary"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.25 }}
      >
        {quote}
      </motion.p>

      <motion.div
        className="mt-8 flex flex-wrap items-center justify-center gap-3"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.35 }}
      >
        <a href="#celebration" className="rounded-xl bg-bucin-gold px-5 py-2.5 font-semibold text-bucin-bg transition hover:bg-bucin-hover">
          Mulai Celebration
        </a>
        <a href="#countdown" className="rounded-xl border border-bucin-gold/50 px-5 py-2.5 font-semibold text-bucin-text transition hover:bg-white/10">
          Lihat Countdown
        </a>
      </motion.div>
    </section>
  );
}
