'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';

export function DailyNotes({ userRole, partnerName }: { userRole: string | null, partnerName: string }) {
  const [myNote, setMyNote] = useState('');
  const [partnerNote, setPartnerNameNote] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const myKey = userRole === 'cowo' ? 'daily_note_cowo' : 'daily_note_cewe';
  const partnerKey = userRole === 'cowo' ? 'daily_note_cewe' : 'daily_note_cowo';

  useEffect(() => {
    if (!supabase) return;

    const fetchNotes = async () => {
      const { data } = await supabase.from('settings').select('key, value');
      if (data) {
        setMyNote(data.find(s => s.key === myKey)?.value || '');
        setPartnerNameNote(data.find(s => s.key === partnerKey)?.value || '');
      }
    };

    fetchNotes();

    // Realtime update saat pasangan ganti note
    const channel = supabase
      .channel('notes_sync')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'settings' }, payload => {
        if (payload.new.key === partnerKey) setPartnerNameNote(payload.new.value);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userRole, myKey, partnerKey]);

  const saveNote = async () => {
    setLoading(true);
    const { error } = await supabase!
      .from('settings')
      .upsert({ key: myKey, value: myNote, updated_at: new Date().toISOString() });
    
    if (!error) setIsEditing(false);
    setLoading(false);
  };

  if (!userRole) return null;

  return (
    <div className="w-full space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Pesan dari Pasangan */}
        <motion.div 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="relative bg-white/5 border border-white/10 p-6 rounded-[2rem] shadow-xl overflow-hidden"
        >
           <div className="absolute top-0 left-0 w-1.5 h-full bg-pink-500/50" />
           <p className="text-[10px] font-bold text-pink-500 uppercase tracking-widest mb-2">Pesan dari {partnerName} ✨</p>
           <p className="text-white italic font-serif text-lg leading-relaxed">
             {partnerNote ? `"${partnerNote}"` : "Belum ada pesan hari ini..."}
           </p>
        </motion.div>

        {/* Pesan dari Saya */}
        <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="relative bg-white/5 border border-white/10 p-6 rounded-[2rem] shadow-xl"
        >
           <div className="flex justify-between items-center mb-2">
              <p className="text-[10px] font-bold text-bucin-gold uppercase tracking-widest">Pesan dariku 📝</p>
              <button onClick={() => setIsEditing(!isEditing)} className="text-[10px] text-white/30 hover:text-white uppercase font-bold tracking-tighter transition-colors">
                {isEditing ? 'Batal' : 'Ubah'}
              </button>
           </div>
           
           <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                   <textarea 
                     value={myNote} onChange={e => setMyNote(e.target.value)}
                     className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-bucin-gold transition-all h-20"
                     placeholder="Tulis pesan manis..."
                     maxLength={100}
                   />
                   <button 
                     onClick={saveNote} disabled={loading}
                     className="w-full py-2 bg-bucin-gold text-bucin-bg rounded-xl font-bold text-xs uppercase tracking-widest"
                   >
                     {loading ? 'Menyimpan...' : 'Simpan Pesan'}
                   </button>
                </motion.div>
              ) : (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-white/60 text-sm italic">
                  {myNote || "Belum ada pesan darimu..."}
                </motion.p>
              )}
           </AnimatePresence>
        </motion.div>

      </div>
    </div>
  );
}
