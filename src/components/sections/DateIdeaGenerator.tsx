'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getLiveSettings } from '@/lib/relationship';

type Idea = {
  title: string;
  description: string;
  icon: string;
};

type AIResult = {
  ideas: Idea[];
  closing: string;
};

export function DateIdeaGenerator() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIResult | null>(null);
  const [mood, setMood] = useState('romantis');

  const generateIdeas = async () => {
    setLoading(true);
    setResult(null);
    try {
      const settings = await getLiveSettings();
      const res = await fetch('/api/ai/date-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          mood,
          location: `${settings.partnerA} di ${settings.partnerALocation || 'sekitar'}, ${settings.partnerB} di ${settings.partnerBLocation || 'sekitar'}`
        }),
      });
      const data = await res.json();
      if (data.ok) setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-xl bg-bucin-gold/10 border border-bucin-gold/30 px-6 py-3 font-bold text-bucin-gold hover:bg-bucin-gold/20 transition-all text-sm"
      >
        Ide Kencan ✨
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-lg rounded-[2.5rem] bg-[#1a1a1a] p-8 border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Ide Kencan AI 💡</h2>
                <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white text-2xl">×</button>
              </div>

              {!result && !loading && (
                <div className="space-y-6">
                  <p className="text-bucin-textSecondary text-sm">Gimana mood kalian hari ini? AI akan mencarikan ide kencan yang paling pas.</p>
                  <div className="flex flex-wrap gap-2">
                    {['romantis', 'petualang', 'santai', 'hemat', 'mewah', 'seru'].map((m) => (
                      <button
                        key={m}
                        onClick={() => setMood(m)}
                        className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                          mood === m ? 'bg-bucin-gold text-bucin-bg' : 'bg-white/5 text-white/40'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={generateIdeas}
                    className="w-full rounded-2xl bg-bucin-gold py-4 font-bold text-bucin-bg shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    Cari Inspirasi Sekarang ➔
                  </button>
                </div>
              )}

              {loading && (
                <div className="py-20 text-center">
                  <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-bucin-gold border-t-transparent mb-4"></div>
                  <p className="text-bucin-gold animate-pulse italic">Mencarikan ide yang paling manis untuk kalian...</p>
                </div>
              )}

              {result && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    {result.ideas.map((idea, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="rounded-2xl bg-white/5 border border-white/10 p-4 hover:border-bucin-gold/30 transition-all"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{idea.icon}</span>
                          <h3 className="font-bold text-white">{idea.title}</h3>
                        </div>
                        <p className="text-sm text-bucin-textSecondary leading-relaxed">{idea.description}</p>
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-center italic text-bucin-gold text-sm font-serif mt-6 px-4">“{result.closing}”</p>
                  <button
                    onClick={() => setResult(null)}
                    className="w-full rounded-xl border border-white/10 py-3 text-sm text-white/40 hover:bg-white/5 mt-4"
                  >
                    Ganti Mood / Cari Lagi
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
