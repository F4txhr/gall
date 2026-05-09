'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=500&q=80',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=500&q=80',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=500&q=80',
];

function SingleRoll({ 
  className = "", 
  reverse = false, 
  speed = 40,
  rotate = 0,
  opacity = 0.5,
  images = []
}: {
  className?: string;
  reverse?: boolean;
  speed?: number;
  rotate?: number;
  opacity?: number;
  images: string[];
}) {
  const displayImages = images.length > 0 ? images : FALLBACK_IMAGES;

  return (
    <div className={`pointer-events-none fixed overflow-hidden select-none ${className}`} style={{ rotate: `${rotate}deg`, opacity }}>
      <motion.div 
        className="flex whitespace-nowrap py-10"
        animate={{ x: reverse ? [-2000, 0] : [0, -2000] }}
        transition={{ repeat: Infinity, duration: speed, ease: "linear" }}
      >
        {[...Array(25)].map((_, i) => (
          <div key={i} className="flex shrink-0 items-center mx-4">
            {/* Film Strip Frame - MUCH LARGER SIZE */}
            <div className="h-64 w-48 bg-[#151515] p-2 border-y-[8px] border-dashed border-[#333] relative shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
               <img 
                src={displayImages[i % displayImages.length]} 
                className="h-full w-full object-cover opacity-100" 
                alt="" 
               />
               {/* Film Perforations - Scaled up */}
               <div className="absolute top-0 left-0 w-full h-full flex justify-between px-2 pointer-events-none">
                  <div className="flex flex-col justify-between h-full py-3">
                    <div className="w-2.5 h-2.5 bg-white/20 rounded-sm"/>
                    <div className="w-2.5 h-2.5 bg-white/20 rounded-sm"/>
                    <div className="w-2.5 h-2.5 bg-white/20 rounded-sm"/>
                    <div className="w-2.5 h-2.5 bg-white/20 rounded-sm"/>
                  </div>
                  <div className="flex flex-col justify-between h-full py-3">
                    <div className="w-2.5 h-2.5 bg-white/20 rounded-sm"/>
                    <div className="w-2.5 h-2.5 bg-white/20 rounded-sm"/>
                    <div className="w-2.5 h-2.5 bg-white/20 rounded-sm"/>
                    <div className="w-2.5 h-2.5 bg-white/20 rounded-sm"/>
                  </div>
               </div>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export function FilmRoll() {
  const [mounted, setMounted] = useState(false);
  const [memories, setMemories] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
    fetch('/api/memories')
      .then(res => res.json())
      .then(data => {
        if (data.memories) {
          const urls = data.memories.map((m: any) => m.url);
          setMemories(urls);
        }
      })
      .catch(() => {});
  }, []);

  if (!mounted) return <></>;

  return (
    <div className="fixed inset-0 -z-50 pointer-events-none overflow-hidden bg-[#080808]">
      {/* 1. Atas - Extra Large & Visible */}
      <SingleRoll 
        className="w-[300%] -top-20 -left-[50%]" 
        rotate={8} 
        speed={40} 
        opacity={0.5} 
        images={memories}
      />

      {/* 2. Bawah - Extra Large & Visible */}
      <SingleRoll 
        className="w-[300%] -bottom-20 -left-[50%]" 
        rotate={-5} 
        reverse={true} 
        speed={50} 
        opacity={0.4} 
        images={memories}
      />

      {/* 3. Tengah - Subtle Background */}
      <SingleRoll 
        className="w-[200%] top-1/2 -translate-y-1/2 -left-40" 
        rotate={-2} 
        speed={90} 
        opacity={0.2} 
        images={memories}
      />

      {/* Lapisan vignette untuk menjaga fokus ke tengah layar */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent to-[#080808] opacity-70" />
    </div>
  );
}
