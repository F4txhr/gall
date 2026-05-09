'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type WishItem = {
  id: string;
  title: string;
  added_by: string;
  rating: number;
  address: string;
  maps_url: string;
  dist_a: string;
  dist_b: string;
  status: string;
  liked_by_cowo: boolean;
  liked_by_cewe: boolean;
};

export function DateWishlist({ userRole }: { userRole: string | null }) {
  const [items, setItems] = useState<WishItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const fetchItems = async () => {
    const res = await fetch('/api/wishlist');
    const data = await res.json();
    setItems(data.items || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const addWish = async () => {
    if (!input.trim() || !userRole) return;
    setIsAdding(true);
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        body: JSON.stringify({ title: input, addedBy: userRole })
      });
      const data = await res.json();
      if (data.ok) {
        setTitle('');
        fetchItems();
      }
    } finally {
      setIsAdding(false);
    }
  };

  const toggleLike = async (item: WishItem) => {
    if (!userRole) return;
    const isLiked = userRole === 'cowo' ? !item.liked_by_cowo : !item.liked_by_cewe;
    
    // Update local UI for instant feedback
    setItems(items.map(i => {
      if (i.id === item.id) {
        return {
          ...i,
          liked_by_cowo: userRole === 'cowo' ? isLiked : i.liked_by_cowo,
          liked_by_cewe: userRole === 'cewe' ? isLiked : i.liked_by_cewe
        };
      }
      return i;
    }));

    await fetch('/api/wishlist', {
      method: 'PATCH',
      body: JSON.stringify({ id: item.id, role: userRole, liked: isLiked })
    });
  };

  const deleteWish = async (id: string) => {
    if (!confirm('Hapus rencana ini?')) return;
    await fetch('/api/wishlist', { method: 'DELETE', body: JSON.stringify({ id }) });
    setItems(items.filter(i => i.id !== id));
  };

  if (loading) return <div className="py-10 text-center text-bucin-gold animate-pulse italic">Mencari daftar rencana kencan...</div>;

  // Sorting: Prioritas (Kedua like) -> Baru (created_at)
  const sortedItems = [...items].sort((a, b) => {
    const bothA = a.liked_by_cowo && a.liked_by_cewe ? 1 : 0;
    const bothB = b.liked_by_cowo && b.liked_by_cewe ? 1 : 0;
    return bothB - bothA;
  });

  return (
    <section id="wishlist" className="mx-auto w-full max-w-5xl px-6 py-16">
      <div className="mb-12 text-center">
        <h2 className="glow-gold text-3xl font-bold text-bucin-gold md:text-4xl">Rencana Kencan Kita ✈️</h2>
        <p className="mt-2 text-sm text-bucin-textSecondary">Tap ❤️ pada tempat yang paling kamu inginkan!</p>
      </div>

      {userRole && (
        <div className="mb-12 flex gap-2 max-w-3xl mx-auto">
          <input
            type="text" placeholder="Mau ke mana kita selanjutnya?"
            className="w-full rounded-2xl bg-white/5 border border-white/10 p-4 text-sm text-white outline-none focus:border-bucin-gold transition-all"
            value={input} onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addWish()}
          />
          <button
            onClick={addWish} disabled={isAdding || !input.trim()}
            className="rounded-2xl bg-bucin-gold px-8 font-bold text-bucin-bg hover:scale-105 active:scale-95 disabled:opacity-50 transition-all text-sm"
          >
            {isAdding ? '...' : 'Tambah'}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {sortedItems.map((item) => {
            const isPriority = item.liked_by_cowo && item.liked_by_cewe;
            const myLike = userRole === 'cowo' ? item.liked_by_cowo : item.liked_by_cewe;
            const partnerLike = userRole === 'cowo' ? item.liked_by_cewe : item.liked_by_cowo;

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className={`group relative overflow-hidden rounded-3xl border transition-all duration-500 p-6 ${
                  isPriority 
                    ? 'border-bucin-gold bg-bucin-gold/5 shadow-[0_0_20px_rgba(212,165,116,0.15)]' 
                    : 'border-white/5 bg-white/[0.02]'
                }`}
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {isPriority && <span className="text-sm">👑</span>}
                        <h3 className={`text-xl font-bold transition-colors ${isPriority ? 'text-bucin-gold' : 'text-white'}`}>{item.title}</h3>
                      </div>
                      <p className="text-[11px] text-bucin-textSecondary leading-relaxed line-clamp-1">{item.address}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => toggleLike(item)}
                        className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all ${
                          myLike 
                            ? 'bg-bucin-pink border-bucin-pink text-white shadow-lg shadow-bucin-pink/20' 
                            : 'bg-white/5 border-white/10 text-white/20 hover:border-white/20'
                        }`}
                      >
                        ❤️
                      </button>
                      <a href={item.maps_url} target="_blank" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-bucin-gold border border-white/10 hover:bg-bucin-gold hover:text-bucin-bg transition-all">📍</a>
                    </div>
                  </div>

                  <div className="mt-6 flex items-end justify-between">
                    <div className="space-y-2">
                      <div className="flex gap-1">
                        <div className={`h-1.5 w-6 rounded-full transition-colors ${item.liked_by_cowo ? 'bg-blue-400' : 'bg-white/10'}`} title="Cowo Like"></div>
                        <div className={`h-1.5 w-6 rounded-full transition-colors ${item.liked_by_cewe ? 'bg-pink-400' : 'bg-white/10'}`} title="Cewe Like"></div>
                      </div>
                      <div className="flex gap-2">
                        <div className="rounded-xl bg-white/5 px-2.5 py-1 border border-white/5">
                          <p className="text-[10px] font-bold text-bucin-gold">{item.dist_a}</p>
                        </div>
                        <div className="rounded-xl bg-white/5 px-2.5 py-1 border border-white/5">
                          <p className="text-[10px] font-bold text-bucin-gold">{item.dist_b}</p>
                        </div>
                      </div>
                    </div>
                    
                    {userRole && (
                      <button onClick={() => deleteWish(item.id)} className="opacity-0 group-hover:opacity-40 hover:opacity-100 transition-opacity text-[10px] text-white/50 uppercase font-bold tracking-tighter">Hapus</button>
                    )}
                  </div>
                </div>
                
                {/* Visual Label jika pasangan juga Like */}
                {partnerLike && !myLike && (
                  <div className="absolute top-0 left-0 w-full h-full pointer-events-none border-2 border-bucin-pink/20 animate-pulse rounded-3xl"></div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {items.length === 0 && (
        <div className="py-20 text-center border border-dashed border-white/5 rounded-[2.5rem]">
          <p className="text-bucin-textSecondary italic">Belum ada rencana kencan. Yuk buat satu! ✨</p>
        </div>
      )}
    </section>
  );
}
