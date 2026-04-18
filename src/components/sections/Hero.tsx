'use client';

import { motion } from 'framer-motion';

export function Hero(): JSX.Element {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center bg-bucin-bg px-6 text-center text-bucin-text">
      <motion.h1
        className="text-4xl font-bold md:text-6xl"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Web Bucin
      </motion.h1>
      <motion.p
        className="mt-4 max-w-xl text-bucin-textSecondary"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        Fondasi awal sudah siap: Next.js + Tailwind + Framer Motion + Firebase/Supabase + Telegram bot.
      </motion.p>
    </section>
  );
}
