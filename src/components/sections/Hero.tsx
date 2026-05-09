'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export function Hero() {
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
        Fondasi awal siap. Sekarang sudah lanjut ke Phase 2: login cowo/cewe + session + redirect role.
      </motion.p>

      <motion.div
        className="mt-8"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
      >
        <Link
          href="/login"
          className="rounded-lg bg-bucin-gold px-6 py-3 font-semibold text-bucin-bg transition hover:bg-bucin-hover"
        >
          Mulai Login
        </Link>
      </motion.div>
    </section>
  );
}
