'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type WishItem = {
  id: string;
  title: string;
  address: string;
  status: string;
};

export function MemoryUpload(): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [takenAt, setTakenAt] = useState(new Date().toISOString().split('T')[0]);
  const [uploading, setUploading] = useState(false);
  
  // State untuk integrasi wishlist
  const [wishlist, setWishlist] = useState<WishItem[]>([]);
  const [selectedWishId, setSelectedWishId] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/wishlist')
        .then(res => res.json())
        .then(data => {
          // Hanya ambil yang belum dikunjungi (pending)
          const pending = (data.items || []).filter((i: WishItem) => i.status === 'pending');
          setWishlist(pending);
        });
    }
  }, [isOpen]);

  const handleWishSelect = (id: string) => {
    setSelectedWishId(id);
    const item = wishlist.find(w => w.id === id);
    if (item) {
      setCaption(item.title);
      setLocation(item.address);
    }
  };

  const handleUpload = async () => {
    if (!files.length) return;
    setUploading(true);

    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('caption', caption);
    formData.append('location', location);
    formData.append('taken_at', new Date(takenAt).toISOString());
    if (selectedWishId) {
      formData.append('wishlist_id', selectedWishId);
    }

    try {
      const res = await fetch('/api/memories', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        alert('Berhasil mengunggah kenangan! ✨');
        setFiles([]);
        setCaption('');
        setLocation('');
        setSelectedWishId('');
        setIsOpen(false);
        window.location.reload(); 
      } else {
        alert('Gagal mengunggah.');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat mengunggah.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-xl bg-bucin-pink/10 border border-bucin-pink/30 px-6 py-3 font-bold text-bucin-pink hover:bg-bucin-pink/20 transition-all text-sm"
      >
        Tambah Memori 📸
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
              <h2 className="text-2xl font-bold text-white mb-6">Ceritakan Momen Ini ✨</h2>
              
              <div className="space-y-4">
                {/* Wishlist Integration */}
                {wishlist.length > 0 && (
                  <div className="rounded-2xl bg-bucin-gold/5 border border-bucin-gold/20 p-4 mb-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-bucin-gold block mb-2">Pilih dari Rencana Kencan?</label>
                    <select 
                      className="w-full bg-transparent text-sm text-white outline-none cursor-pointer"
                      value={selectedWishId}
                      onChange={(e) => handleWishSelect(e.target.value)}
                    >
                      <option value="" className="bg-[#1a1a1a]">-- Tidak, momen baru --</option>
                      {wishlist.map(item => (
                        <option key={item.id} value={item.id} className="bg-[#1a1a1a]">
                          {item.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer rounded-2xl border-2 border-dashed border-white/10 bg-white/5 p-8 text-center hover:border-bucin-pink/40 transition-all"
                >
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={(e) => setFiles(Array.from(e.target.files || []))}
                  />
                  {files.length > 0 ? (
                    <p className="text-bucin-pink font-medium">{files.length} foto terpilih</p>
                  ) : (
                    <p className="text-bucin-textSecondary">Klik untuk pilih beberapa foto sekaligus</p>
                  )}
                </div>

                <input
                  type="text"
                  placeholder="Judul Album"
                  className="w-full rounded-xl bg-white/5 border border-white/10 p-3 text-sm text-white outline-none focus:border-bucin-pink"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                />

                <input
                  type="text"
                  placeholder="Lokasi (misal: Bandung, Kafe X)"
                  className="w-full rounded-xl bg-white/5 border border-white/10 p-3 text-sm text-white outline-none focus:border-bucin-pink"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase text-bucin-textSecondary ml-1 tracking-widest">Kapan momen ini terjadi?</label>
                  <input
                    type="date"
                    className="w-full rounded-xl bg-white/5 border border-white/10 p-3 text-sm text-white outline-none focus:border-bucin-pink"
                    value={takenAt}
                    onChange={(e) => setTakenAt(e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 rounded-xl bg-white/5 py-3 font-semibold text-white/60 hover:bg-white/10"
                >
                  Batal
                </button>
                <button
                  disabled={uploading || !files.length}
                  onClick={handleUpload}
                  className="flex-1 rounded-xl bg-bucin-pink py-3 font-bold text-white shadow-lg shadow-bucin-pink/20 disabled:opacity-50"
                >
                  {uploading ? 'Mengunggah...' : 'Simpan Momen'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
