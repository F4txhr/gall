'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

type Photo = {
  id: string;
  url: string;
  caption: string;
  location: string;
  taken_at: string;
  created_at: string;
  batch_id?: string;
};

type Layout = 'scrapbook' | 'museum' | 'deck';

export function MemoryWall({ initialLayout }: { initialLayout?: Layout }) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const [editForm, setEditForm] = useState({ caption: '', location: '', taken_at: '' });

  const [layout, setLayout] = useState<Layout>(initialLayout || 'scrapbook');
  const [activeIndices, setActiveIndices] = useState<Record<string, number>>({});

  // LOGIKA PENGUNCI SCROLL
  useEffect(() => {
    if (selectedPhoto || editingPhoto) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.touchAction = 'auto';
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.touchAction = 'auto';
    };
  }, [selectedPhoto, editingPhoto]);

  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('memories').select('*').order('created_at', { ascending: false });
    setPhotos(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPhotos();
    fetch('/api/me').then(res => res.json()).then(data => setUserRole(data.role));
  }, [fetchPhotos]);

  const groupedPhotos = useMemo(() => {
    const groups: Record<string, Photo[]> = {};
    photos.forEach(photo => {
      const bid = photo.batch_id || photo.id;
      if (!groups[bid]) groups[bid] = [];
      groups[bid].push(photo);
    });
    return Object.values(groups);
  }, [photos]);

  // LOGIKA ROLLING FOTO UNTUK DECK
  useEffect(() => {
    if (layout !== 'deck' || groupedPhotos.length === 0) return;
    const interval = setInterval(() => {
      setActiveIndices(prev => {
        const next = { ...prev };
        groupedPhotos.forEach(batch => {
          if (batch.length > 1) {
            const bid = batch[0].batch_id || batch[0].id;
            next[bid] = ((next[bid] || 0) + 1) % batch.length;
          }
        });
        return next;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [layout, groupedPhotos]);

  const handleSetLayout = async (newLayout: Layout) => {
    setLayout(newLayout);
    await fetch('/api/me', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'gallery_layout', value: newLayout }) });
  };

  const startEdit = (e: React.MouseEvent, photo: Photo) => {
    e.stopPropagation();
    setEditingPhoto(photo);
    setEditForm({
      caption: photo.caption || '',
      location: photo.location || '',
      taken_at: new Date(photo.taken_at || photo.created_at).toISOString().split('T')[0]
    });
  };

  const handleSaveEdit = async () => {
    if (!editingPhoto) return;
    const isBatch = editingPhoto.batch_id && window.confirm('Update seluruh tumpukan ini?');
    const res = await fetch('/api/memories', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        caption: editForm.caption, location: editForm.location, takenAt: editForm.taken_at,
        ...(isBatch ? { batchId: editingPhoto.batch_id } : { id: editingPhoto.id })
      }),
    });
    if (res.ok) { fetchPhotos(); setEditingPhoto(null); setSelectedPhoto(null); }
  };

  const handleDelete = async () => {
    if (!editingPhoto || !window.confirm('Hapus foto ini?')) return;
    const res = await fetch('/api/memories', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editingPhoto.id, url: editingPhoto.url }),
    });
    if (res.ok) { fetchPhotos(); setEditingPhoto(null); setSelectedPhoto(null); }
  };

  return (
    <section className="relative z-10 mx-auto max-w-7xl px-4 py-12">
      <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-6">
        <div className="text-center md:text-left">
          <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">Our Stories ✨</h2>
          <p className="text-zinc-500 text-sm mt-1">Lini masa indah kita berdua.</p>
        </div>
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 backdrop-blur-sm">
          {(['scrapbook', 'museum', 'deck'] as Layout[]).map((l) => (
            <button key={l} onClick={() => handleSetLayout(l)} className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${layout === l ? 'bg-bucin-gold text-bucin-bg shadow-lg' : 'text-white/40 hover:text-white'}`}>{l}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="h-10 w-10 animate-spin rounded-full border-4 border-bucin-gold border-t-transparent" /></div>
      ) : (
        <div className="relative">
          {photos.length === 0 ? (
             <div className="text-center py-20 bg-white/5 rounded-[3rem] border border-dashed border-white/10 text-zinc-500 italic">Belum ada kenangan...</div>
          ) : (
            <div className={`
                ${layout === 'scrapbook' ? 'columns-2 md:columns-3 lg:columns-4 gap-6 space-y-12' : ''}
                ${layout === 'museum' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12' : ''}
                ${layout === 'deck' ? 'flex flex-wrap justify-center gap-24' : ''}
            `}>
              
              {(layout === 'deck' ? groupedPhotos : photos.map(p => [p])).map((batch, bIdx) => {
                const bid = batch[0].batch_id || batch[0].id;
                const currentIdx = activeIndices[bid] || 0;
                const topPhoto = batch[currentIdx];
                const nextPhoto = batch[(currentIdx + 1) % batch.length];
                const isDeck = layout === 'deck';

                return (
                  <motion.div key={topPhoto.id} layout className={`relative ${isDeck ? 'w-64 md:w-72 aspect-[3/4]' : ''}`} onClick={() => setSelectedPhoto(topPhoto)}>
                    {/* VISUAL STACK - MENAMPILKAN FOTO ASLI DI LAPISAN BAWAH */}
                    {isDeck && batch.length > 1 && (
                      <>
                        <div className="absolute inset-0 rounded-3xl rotate-6 translate-x-4 translate-y-3 -z-10 shadow-xl overflow-hidden border border-white/10">
                            <img src={nextPhoto.url} className="w-full h-full object-cover blur-[2px] opacity-40" alt="" />
                        </div>
                        <div className="absolute inset-0 rounded-3xl -rotate-3 -translate-x-2 translate-y-1 -z-20 shadow-lg overflow-hidden border border-white/10 bg-zinc-900">
                             <img src={batch[0].url} className="w-full h-full object-cover blur-[4px] opacity-20" alt="" />
                        </div>
                      </>
                    )}

                    <div className={`
                      relative cursor-pointer overflow-hidden shadow-2xl transition-all duration-500 hover:scale-[1.03]
                      ${layout === 'scrapbook' ? (bIdx % 2 === 0 ? 'rotate-2 bg-white p-3 pb-12' : '-rotate-2 bg-white p-3 pb-12') : ''}
                      ${layout === 'museum' ? 'aspect-square border-[12px] border-zinc-800 bg-zinc-900 p-2' : 'rounded-3xl aspect-[4/5] bg-zinc-900 border border-white/10'}
                    `}>
                      <AnimatePresence mode="wait">
                        <motion.img 
                          key={topPhoto.id}
                          initial={{ opacity: 0.5 }} animate={{ opacity: 1 }} exit={{ opacity: 0.5 }}
                          transition={{ duration: 1 }}
                          src={topPhoto.url} className="w-full h-full object-cover grayscale-[10%] group-hover:grayscale-0" alt="" crossOrigin="anonymous" 
                        />
                      </AnimatePresence>
                      
                      {isDeck && batch.length > 1 && (
                        <div className="absolute top-4 right-4 bg-bucin-gold text-bucin-bg text-[10px] font-black px-2 py-1 rounded-full shadow-xl z-20">
                          {currentIdx + 1} / {batch.length}
                        </div>
                      )}
                      
                      {layout === 'scrapbook' && (
                        <p className="absolute bottom-3 left-0 w-full text-center font-dancing text-zinc-800 text-lg px-4 truncate">{topPhoto.caption}</p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* FULLSCREEN PREVIEW */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-center p-4 touch-none"
          >
            <div className="absolute inset-0" onClick={() => setSelectedPhoto(null)} />
            
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="relative z-10 w-full max-w-5xl flex flex-col items-center gap-6">
                <img src={selectedPhoto.url} className="max-h-[70vh] md:max-h-[75vh] max-w-full object-contain rounded-lg shadow-2xl" crossOrigin="anonymous" />
                
                <div className="text-center space-y-2 px-6">
                   <h3 className="text-white text-2xl font-black italic tracking-tight">"{selectedPhoto.caption || 'Our Story'}"</h3>
                   <p className="text-zinc-500 text-[10px] uppercase tracking-[0.3em] font-bold">{selectedPhoto.location || 'Somewhere Special'} • {new Date(selectedPhoto.taken_at || selectedPhoto.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>

                {userRole && (
                  <button onClick={(e) => startEdit(e, selectedPhoto)} className="mt-4 px-10 py-3.5 bg-white/10 border border-white/10 rounded-full text-xs font-black uppercase tracking-widest text-white/70 hover:text-white hover:bg-white/20 transition-all backdrop-blur-xl">⚙️ Manage Memory</button>
                )}
            </motion.div>
            <button onClick={() => setSelectedPhoto(null)} className="absolute top-8 right-8 text-white/20 hover:text-white text-5xl transition-colors font-thin">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* EDIT FORM MODAL */}
      <AnimatePresence>
        {editingPhoto && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/90 backdrop-blur-sm p-6 touch-none">
             <div className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-[3rem] p-10 shadow-2xl space-y-8">
                <div className="text-center"><h4 className="text-2xl font-black text-white italic tracking-tighter">Edit Detail</h4></div>
                <div className="space-y-5">
                   <div className="space-y-1"><label className="text-[10px] font-bold text-pink-500 uppercase ml-2">Title</label><input type="text" value={editForm.caption} onChange={e => setEditForm({...editForm, caption: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white outline-none focus:border-pink-500" /></div>
                   <div className="space-y-1"><label className="text-[10px] font-bold text-pink-500 uppercase ml-2">Location</label><input type="text" value={editForm.location} onChange={e => setEditForm({...editForm, location: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white outline-none focus:border-pink-500" /></div>
                   <div className="space-y-1"><label className="text-[10px] font-bold text-pink-500 uppercase ml-2">Date</label><input type="date" value={editForm.taken_at} onChange={e => setEditForm({...editForm, taken_at: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white outline-none focus:border-pink-500" /></div>
                </div>
                <div className="pt-4 flex flex-col gap-3">
                   <button onClick={handleSaveEdit} className="w-full py-5 bg-white text-black font-black rounded-2xl text-sm uppercase tracking-tighter shadow-xl">Save Changes</button>
                   <div className="grid grid-cols-2 gap-3">
                      <button onClick={handleDelete} className="py-4 bg-red-600/10 text-red-500 border border-red-600/20 font-bold rounded-2xl text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">🗑️ Delete</button>
                      <button onClick={() => setEditingPhoto(null)} className="py-4 bg-zinc-800 text-zinc-400 font-bold rounded-2xl text-[10px] uppercase tracking-widest">Cancel</button>
                   </div>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
