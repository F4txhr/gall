'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Memory = {
  id: string;
  url: string;
  caption: string;
  location?: string;
  taken_at: string;
  batch_id?: string;
};

type Album = {
  batchId: string;
  title: string;
  date: string; // Readable date
  rawDate: string; // ISO date for input
  location: string;
  photos: Memory[];
};

type LayoutStyle = 'scrapbook' | 'museum' | 'deck';

export function MemoryWall({ initialLayout }: { initialLayout?: LayoutStyle }): JSX.Element {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [layout, setLayout] = useState<LayoutStyle>('scrapbook');
  const [activeAlbum, setActiveAlbum] = useState<Album | null>(null);
  const [deckIndexes, setDeckIndexes] = useState<Record<string, number>>({});
  const [userRole, setUserRole] = useState<string | null>(null);

  // State untuk Modal Edit
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [editForm, setEditForm] = useState({ title: '', location: '', date: '' });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetch('/api/me').then(res => res.json()).then(data => setUserRole(data.role));
  }, []);

  useEffect(() => {
    if (initialLayout) setLayout(initialLayout);
  }, [initialLayout]);

  useEffect(() => {
    if (activeAlbum || selectedImage || editingAlbum) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [activeAlbum, selectedImage, editingAlbum]);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/memories');
      const data = await res.json();
      const rawMemories: Memory[] = data.memories || [];
      
      const groups: Record<string, Album> = {};
      rawMemories.forEach((m) => {
        const bId = m.batch_id || `single_${m.id}`;
        if (!groups[bId]) {
          groups[bId] = {
            batchId: bId,
            title: m.caption,
            date: new Date(m.taken_at).toLocaleDateString('id-ID', {
              day: 'numeric', month: 'long', year: 'numeric',
            }),
            rawDate: new Date(m.taken_at).toISOString().split('T')[0],
            location: m.location || '',
            photos: [],
          };
        }
        groups[bId].photos.push(m);
      });

      const albumList = Object.values(groups);
      setAlbums(albumList);
      
      const idxs: Record<string, number> = {};
      albumList.forEach(a => idxs[a.batchId] = 0);
      setDeckIndexes(idxs);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('gallery_layout') as LayoutStyle;
    if (saved) setLayout(saved);
    fetchData();
  }, []);

  useEffect(() => {
    if (layout !== 'deck' || loading || albums.length === 0) return;
    const interval = setInterval(() => {
      setDeckIndexes(prev => {
        const next = { ...prev };
        albums.forEach(album => {
          if (album.photos.length > 1) {
            next[album.batchId] = (prev[album.batchId] + 1) % album.photos.length;
          }
        });
        return next;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [layout, albums, loading]);

  const changeLayout = (newLayout: LayoutStyle) => {
    setLayout(newLayout);
    localStorage.setItem('gallery_layout', newLayout);
  };

  const deletePhoto = async (id: string) => {
    if (!confirm('Hapus kenangan ini? Foto juga akan dihapus dari storage.')) return;
    try {
      const res = await fetch('/api/memories', {
        method: 'DELETE',
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        if (activeAlbum) {
          const newPhotos = activeAlbum.photos.filter(p => p.id !== id);
          if (newPhotos.length === 0) setActiveAlbum(null);
          else setActiveAlbum({ ...activeAlbum, photos: newPhotos });
        }
        fetchData(); 
      }
    } catch (err) {
      alert('Gagal menghapus foto.');
    }
  };

  // Logika Edit Album
  const startEdit = (album: Album) => {
    setEditingAlbum(album);
    setEditForm({
      title: album.title,
      location: album.location,
      date: album.rawDate
    });
  };

  const handleUpdate = async () => {
    if (!editingAlbum) return;
    setIsUpdating(true);
    try {
      const res = await fetch('/api/memories', {
        method: 'PATCH',
        body: JSON.stringify({
          batchId: editingAlbum.batchId,
          caption: editForm.title,
          location: editForm.location,
          takenAt: new Date(editForm.date).toISOString()
        }),
      });
      if (res.ok) {
        alert('Album berhasil diperbarui! ✨');
        setEditingAlbum(null);
        fetchData();
      }
    } catch (err) {
      alert('Gagal memperbarui album.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-bucin-gold border-t-transparent"></div>
    </div>
  );

  if (albums.length === 0) return <></>;

  return (
    <section id="memories" className="mx-auto w-full max-w-7xl px-6 py-24">
      <div className="mb-20 flex flex-col items-center text-center">
        <h2 className="glow-gold text-4xl font-bold text-bucin-gold md:text-6xl mb-6">Gallery Kenangan 🎞️</h2>
        <div className="flex gap-2 p-1 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
          {(['scrapbook', 'museum', 'deck'] as LayoutStyle[]).map((s) => (
            <button
              key={s}
              onClick={() => changeLayout(s)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                layout === s ? 'bg-bucin-gold text-bucin-bg' : 'text-white/40 hover:text-white'
              }`}
            >
              {s === 'deck' ? 'Deck (Kartu)' : s}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-16">
        {albums.map((album, aIdx) => (
          <div key={album.batchId} className="relative group/album">
            
            {/* Header Album dengan Tombol Edit */}
            {(layout === 'scrapbook' || layout === 'deck') && (
              <div className="mb-12 flex flex-col items-center text-center relative">
                <div className="mb-4 inline-block rounded-full bg-bucin-gold/10 border border-bucin-gold/30 px-6 py-2">
                  <span className="text-xs font-bold uppercase tracking-[0.3em] text-bucin-gold">{album.date}</span>
                </div>
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl md:text-4xl font-bold text-white">{album.title}</h3>
                  {userRole && (
                    <button 
                      onClick={() => startEdit(album)}
                      className="h-8 w-8 rounded-full bg-white/5 text-white/40 hover:text-bucin-gold hover:bg-white/10 transition-all flex items-center justify-center text-sm"
                      title="Edit Album"
                    >
                      ✏️
                    </button>
                  )}
                </div>
                {album.location && <p className="mt-2 text-sm text-bucin-textSecondary">📍 {album.location}</p>}
              </div>
            )}

            {layout === 'scrapbook' && (
              <div className="flex flex-wrap justify-center gap-10 md:gap-16">
                {album.photos.map((photo, pIdx) => (
                  <motion.div
                    key={photo.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1, rotate: (pIdx + aIdx) % 2 === 0 ? -4 : 4 }}
                    viewport={{ once: true }}
                    whileHover={{ rotate: 0, scale: 1.1, zIndex: 20 }}
                    className="cursor-pointer bg-white p-3 pb-12 shadow-2xl transition-all duration-500 md:p-4 md:pb-16 relative group"
                  >
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-16 h-8 bg-bucin-gold/30 backdrop-blur-sm rotate-2 z-10 border border-white/10"></div>
                    {userRole && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); deletePhoto(photo.id); }}
                        className="absolute -top-2 -right-2 z-30 h-8 w-8 rounded-full bg-red-500 text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    )}
                    <div onClick={() => setSelectedImage(photo.url)} className="relative aspect-[4/5] w-48 md:w-56 overflow-hidden bg-gray-100">
                      <img src={photo.url} className="h-full w-full object-cover grayscale-[10%] hover:grayscale-0 transition-all duration-700" alt="" />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {layout === 'museum' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-1 md:gap-2">
                  {album.photos.map((photo) => (
                    <motion.div
                      key={photo.id}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      whileHover={{ scale: 0.98, zIndex: 10 }}
                      className="cursor-pointer aspect-square overflow-hidden border border-white/5 group relative"
                    >
                      {userRole && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); deletePhoto(photo.id); }}
                          className="absolute top-2 right-2 z-30 h-6 w-6 rounded-full bg-black/50 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      )}
                      <img onClick={() => setSelectedImage(photo.url)} src={photo.url} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                    </motion.div>
                  ))}
                </div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 px-2">
                   <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-lg">{album.title}</h3>
                      {userRole && (
                        <button onClick={() => startEdit(album)} className="text-white/20 hover:text-bucin-gold transition-colors text-xs">✏️ Edit</button>
                      )}
                   </div>
                   <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest font-bold text-bucin-gold opacity-60">
                      <span>{album.date}</span>
                      {album.location && <span>📍 {album.location}</span>}
                   </div>
                </div>
              </div>
            )}

            {layout === 'deck' && (
              <div className="flex flex-col items-center">
                <div 
                  className="relative h-[350px] w-[250px] md:h-[450px] md:w-[320px] mb-8 cursor-pointer group"
                  onClick={() => setActiveAlbum(album)}
                >
                  {album.photos.length > 1 ? (
                    <>
                      <div className="absolute inset-0 z-10 translate-x-6 translate-y-6 rotate-6 bg-white p-2 pb-10 shadow-md opacity-40">
                         <div className="h-full w-full overflow-hidden bg-gray-200">
                           <img src={album.photos[(deckIndexes[album.batchId] + 2) % album.photos.length].url} className="h-full w-full object-cover blur-[1px]" alt="" />
                         </div>
                      </div>
                      <div className="absolute inset-0 z-20 translate-x-3 translate-y-3 rotate-3 bg-white p-2 pb-10 shadow-lg opacity-70">
                         <div className="h-full w-full overflow-hidden bg-gray-200">
                           <img src={album.photos[(deckIndexes[album.batchId] + 1) % album.photos.length].url} className="h-full w-full object-cover" alt="" />
                         </div>
                      </div>
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={`${album.batchId}-${deckIndexes[album.batchId]}`}
                          initial={{ x: 50, opacity: 0, rotate: 5, zIndex: 40 }}
                          animate={{ x: 0, opacity: 1, rotate: 0, zIndex: 40 }}
                          exit={{ x: -150, opacity: 0, rotate: -15, zIndex: 0 }}
                          transition={{ type: 'spring', stiffness: 260, damping: 25 }}
                          className="absolute inset-0"
                        >
                          <div className="h-full w-full bg-white p-3 pb-12 shadow-2xl border border-gray-100 relative">
                            <div className="h-full w-full overflow-hidden bg-gray-50">
                               <img src={album.photos[deckIndexes[album.batchId] || 0].url} className="h-full w-full object-cover" alt="" />
                            </div>
                            <div className="absolute bottom-2 left-0 w-full text-center">
                               <span className="text-[9px] uppercase tracking-widest text-gray-300 font-bold">Momen {deckIndexes[album.batchId] + 1} / {album.photos.length}</span>
                            </div>
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    </>
                  ) : (
                    <motion.div className="absolute inset-0 z-30" whileHover={{ scale: 1.02 }}>
                       <div className="h-full w-full bg-white p-3 pb-12 shadow-2xl border border-gray-100">
                        <div className="h-full w-full overflow-hidden bg-gray-50">
                           <img src={album.photos[0].url} className="h-full w-full object-cover" alt="" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-full text-center opacity-0 group-hover:opacity-100 transition-opacity">
                     <span className="text-[10px] uppercase tracking-widest text-bucin-gold font-bold">
                        {album.photos.length > 1 ? `Lihat ${album.photos.length} foto ➔` : 'Perbesar foto ➔'}
                     </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* MODAL: EDIT ALBUM */}
      <AnimatePresence>
        {editingAlbum && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[250] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="w-full max-w-md rounded-[2rem] bg-[#1a1a1a] p-8 border border-white/10 shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">✏️ Edit Album</h2>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-bucin-gold font-bold ml-1">Judul Album</label>
                  <input 
                    type="text" className="w-full rounded-xl bg-white/5 border border-white/10 p-3 text-white outline-none focus:border-bucin-gold"
                    value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-bucin-gold font-bold ml-1">Lokasi</label>
                  <input 
                    type="text" className="w-full rounded-xl bg-white/5 border border-white/10 p-3 text-white outline-none focus:border-bucin-gold"
                    value={editForm.location} onChange={e => setEditForm({...editForm, location: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-bucin-gold font-bold ml-1">Tanggal</label>
                  <input 
                    type="date" className="w-full rounded-xl bg-white/5 border border-white/10 p-3 text-white outline-none focus:border-bucin-gold"
                    value={editForm.date} onChange={e => setEditForm({...editForm, date: e.target.value})}
                  />
                </div>
              </div>
              <div className="mt-8 flex gap-3">
                <button onClick={() => setEditingAlbum(null)} className="flex-1 rounded-xl bg-white/5 py-3 font-semibold text-white/60 hover:bg-white/10">Batal</button>
                <button 
                  disabled={isUpdating} onClick={handleUpdate}
                  className="flex-1 rounded-xl bg-bucin-gold py-3 font-bold text-bucin-bg shadow-lg disabled:opacity-50"
                >
                  {isUpdating ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* OVERLAY: EXPANDED ALBUM */}
      <AnimatePresence>
        {activeAlbum && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-[#0a0a0a] overflow-y-auto custom-scrollbar"
          >
            <div className="sticky top-0 z-20 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/5 p-6 md:px-12">
               <div className="max-w-7xl mx-auto flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl md:text-4xl font-bold text-white">{activeAlbum.title}</h3>
                    <p className="text-bucin-gold uppercase tracking-widest text-xs font-bold mt-2">
                      {activeAlbum.date} {activeAlbum.location && `• 📍 ${activeAlbum.location}`} • {activeAlbum.photos.length} Kenangan
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {userRole && (
                      <button onClick={() => startEdit(activeAlbum)} className="h-12 px-6 rounded-full bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-all text-sm font-bold border border-white/10">✏️ Edit</button>
                    )}
                    <button onClick={() => setActiveAlbum(null)} className="h-12 w-12 flex items-center justify-center rounded-full bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-all text-4xl">×</button>
                  </div>
               </div>
            </div>
            <div className="max-w-7xl mx-auto p-6 md:p-12">
               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                  {activeAlbum.photos.map((p, idx) => (
                    <motion.div
                      key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                      className="cursor-pointer group relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/10"
                    >
                      {userRole && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); deletePhoto(p.id); }}
                          className="absolute top-4 right-4 z-30 h-10 w-10 rounded-full bg-red-500 text-white shadow-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          🗑️
                        </button>
                      )}
                      <img onClick={() => setSelectedImage(p.url)} src={p.url} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                    </motion.div>
                  ))}
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            className="fixed inset-0 z-[300] flex items-center justify-center bg-black/98 p-4 backdrop-blur-xl"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
          >
            <motion.img
              src={selectedImage}
              className="max-h-[90vh] max-w-full rounded-lg shadow-2xl border-4 border-white/10"
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
            />
            <button className="absolute top-10 right-10 text-white/40 hover:text-white text-5xl" onClick={() => setSelectedImage(null)}>×</button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
