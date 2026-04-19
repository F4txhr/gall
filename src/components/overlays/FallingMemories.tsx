'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function FallingMemories() {
  const [photos, setPhotos] = useState<string[]>([]);
  const [elements, setElements] = useState<any[]>([]);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const res = await fetch('/api/memories');
        if (res.ok) {
          const data = await res.json();
          const urls = (data.memories || []).map((m: any) => m.url);
          if (urls.length > 0) setPhotos(urls);
        }
      } catch {}
    };
    fetchPhotos();
  }, []);

  useEffect(() => {
    if (photos.length === 0) return;

    // Generate continuous falling photos
    const interval = setInterval(() => {
      const newEl = {
        id: Date.now(),
        url: photos[Math.floor(Math.random() * photos.length)],
        x: Math.random() * 90, // Random X position
        rotate: Math.random() * 40 - 20,
        size: Math.random() * (120 - 80) + 80,
      };
      setElements((prev) => [...prev.slice(-15), newEl]);
    }, 800);

    return () => clearInterval(interval);
  }, [photos]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {elements.map((el) => (
        <motion.div
          key={el.id}
          initial={{ y: -150, x: `${el.x}vw`, opacity: 0, rotate: el.rotate }}
          animate={{ y: '110vh', opacity: [0, 1, 1, 0] }}
          transition={{ duration: 7, ease: 'linear' }}
          className="absolute border-4 border-white shadow-xl bg-white p-1"
          style={{ width: `${el.size}px` }}
        >
          <img src={el.url} className="w-full grayscale brightness-90" alt="" />
        </motion.div>
      ))}
    </div>
  );
}
