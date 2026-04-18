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

  return (
    <section className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1 className="text-4xl font-bold md:text-6xl">{typed}</h1>
      <span className="mt-2 h-6 text-2xl text-bucin-gold">|</span>

      <motion.p
        className="mt-6 max-w-2xl text-bucin-textSecondary"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        {relationshipConfig.quote}
      </motion.p>

      <motion.div
        className="mt-10 text-sm uppercase tracking-[0.2em] text-bucin-textSecondary"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.8 }}
      >
        Scroll untuk lanjut ↓
      </motion.div>
    </section>
  );
}
