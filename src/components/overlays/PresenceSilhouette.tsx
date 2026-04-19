'use client';

import { motion } from 'framer-motion';

export function PresenceSilhouette({ role }: { role: 'cowo' | 'cewe' }) {
  // Siluet Sederhana SVG
  return (
    <motion.div 
      initial={{ opacity: 0, x: role === 'cowo' ? -50 : 50 }}
      animate={{ opacity: 0.4, x: 0 }}
      className={`fixed bottom-0 ${role === 'cowo' ? 'left-0' : 'right-0'} z-[100] pointer-events-none`}
    >
      <svg width="300" height="500" viewBox="0 0 200 400" fill="currentColor" className="text-white">
        {role === 'cowo' ? (
          <path d="M100 50c-20 0-35 15-35 35s15 35 35 35 35-15 35-35-15-35-35-35zm-50 100c-20 0-40 20-40 40v150h180V190c0-20-20-40-40-40h-100z" />
        ) : (
          <path d="M100 50c-15 0-30 15-30 35s15 30 30 30 30-15 30-30-15-35-30-35zm-60 100c-20 0-30 30-30 60v130c0 20 20 40 40 40h100c20 0 40-20 40-40V210c0-30-10-60-30-60H40z" />
        )}
      </svg>
      <p className="text-center text-[10px] uppercase tracking-widest mt-2 font-bold italic opacity-60">
        Dia sedang menemanimu...
      </p>
    </motion.div>
  );
}
