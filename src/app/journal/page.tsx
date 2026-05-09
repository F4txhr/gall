'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

type Entry = {
  id: string;
  role: 'cowo' | 'cewe';
  content: string;
  created_at: string;
};

export default function JournalPage() {
  const [isLocked, setIsLocked] = useState(true);
  const [pinInput, setPinInput] = useState('');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [newNote, setNewNote] = useState('');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [correctPin, setCorrectPin] = useState('');

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/me').then(res => res.json()).then(data => {
      setUserRole(data.role);
      // Gunakan tanggal jadian sebagai PIN (tanpa tanda hubung, misal 20240101)
      const pin = data.settings?.relationshipStart?.split('T')[0].replace(/-/g, '') || '1234';
      setCorrectPin(pin);
    });

    if (!supabase) return;

    const fetchJournal = async () => {
      const { data } = await supabase.from('journal').select('*').order('created_at', { ascending: true });
      if (data) setEntries(data);
    };

    fetchJournal();

    const channel = supabase
      .channel('journal_live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'journal' }, payload => {
        setEntries(prev => [...prev, payload.new as Entry]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [entries]);

  const handleUnlock = () => {
    if (pinInput === correctPin) {
      setIsLocked(false);
    } else {
      alert('PIN Salah! Hint: Tanggal Jadian (YYYYMMDD)');
      setPinInput('');
    }
  };

  const saveEntry = async () => {
    if (!newNote.trim() || !userRole) return;
    setLoading(true);
    const { error } = await supabase!
      .from('journal')
      .insert({ role: userRole, content: newNote });
    
    if (!error) setNewNote('');
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white font-sans selection:bg-pink-500/30">
      <AnimatePresence mode="wait">
        {isLocked ? (
          <motion.div 
            key="lock"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.1 }}
            className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-black backdrop-blur-3xl"
          >
            <div className="mb-10 text-center space-y-2">
               <div className="text-5xl mb-4">🔒</div>
               <h2 className="text-2xl font-black italic tracking-tighter uppercase">Private Journal</h2>
               <p className="text-zinc-500 text-[10px] uppercase tracking-[0.3em]">Enter our special date to unlock</p>
            </div>
            
            <div className="flex flex-col items-center gap-6 w-full max-w-xs">
              <input 
                type="password" value={pinInput} onChange={e => setPinInput(e.target.value)}
                placeholder="YYYYMMDD"
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-center text-2xl tracking-[0.5em] focus:border-pink-500 outline-none transition-all"
                onKeyDown={e => e.key === 'Enter' && handleUnlock()}
              />
              <button onClick={handleUnlock} className="w-full py-4 bg-white text-black font-black rounded-2xl uppercase tracking-widest hover:bg-zinc-200 transition-all active:scale-95">Unlock Memories</button>
              <Link href="/" className="text-zinc-600 text-[10px] font-bold uppercase hover:text-white transition-colors">Go Back</Link>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="journal"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto px-6 py-20 flex flex-col h-screen"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-12 border-b border-white/5 pb-8">
               <div>
                  <h1 className="text-3xl font-black italic tracking-tighter uppercase">Our Shared Journal 📖</h1>
                  <p className="text-zinc-500 text-xs mt-1 uppercase tracking-widest">Ruang rahasia untuk kata-kata abadi kita.</p>
               </div>
               <Link href="/" className="h-10 w-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-zinc-500 hover:text-white transition-all">✕</Link>
            </div>

            {/* Content Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-10 pr-4 custom-scrollbar scroll-smooth mb-10">
               {entries.length === 0 && (
                 <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                    <p className="italic font-serif text-lg">"Halaman ini masih kosong, mulailah menulis surat pertamamu..."</p>
                 </div>
               )}
               {entries.map((entry) => (
                 <motion.div 
                    key={entry.id}
                    initial={{ opacity: 0, x: entry.role === userRole ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex flex-col ${entry.role === userRole ? 'items-end' : 'items-start'}`}
                 >
                    <div className={`max-w-[85%] p-8 rounded-[2.5rem] font-serif text-lg leading-relaxed shadow-2xl relative
                        ${entry.role === userRole ? 'bg-zinc-900 border-zinc-800 text-white rounded-tr-none' : 'bg-white text-black rounded-tl-none'}
                    `}>
                        <div className={`absolute top-4 ${entry.role === userRole ? '-left-3' : '-right-3'} opacity-10 text-6xl select-none`}>
                            {entry.role === userRole ? '✍️' : '💌'}
                        </div>
                        <p className="relative z-10 whitespace-pre-wrap">{entry.content}</p>
                        <div className={`mt-6 pt-4 border-t border-current/10 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest opacity-40`}>
                           <span>{entry.role === 'cowo' ? 'Cowo' : 'Cewe'}</span>
                           <span>{new Date(entry.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                    </div>
                 </motion.div>
               ))}
            </div>

            {/* Input Area */}
            <div className="relative group">
               <div className="absolute inset-0 bg-pink-500/10 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
               <div className="relative flex flex-col gap-4 bg-zinc-900 border border-white/10 rounded-[2.5rem] p-6 shadow-2xl">
                  <textarea 
                    value={newNote} onChange={e => setNewNote(e.target.value)}
                    placeholder="Tulis surat cinta panjang untuknya di sini..."
                    className="w-full bg-transparent border-none outline-none text-white font-serif text-lg leading-relaxed h-32 resize-none"
                  />
                  <div className="flex justify-between items-center border-t border-white/5 pt-4">
                     <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Writing as {userRole}</p>
                     <button 
                        onClick={saveEntry} disabled={loading || !newNote.trim()}
                        className="px-8 py-3 bg-white text-black rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all disabled:opacity-30"
                     >
                        {loading ? 'Sending...' : 'Send Letter ➔'}
                     </button>
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
