'use client';

import { useEffect, useState } from 'react';

export function FilmRoll(): JSX.Element | null {
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const res = await fetch('/api/memories');
        if (res.ok) {
          const data = await res.json();
          const urls = (data.memories || []).map((m: any) => m.url);
          if (urls.length > 0) {
            // Duplikasi foto agar scroll terasa tidak putus (infinite)
            setPhotos([...urls, ...urls, ...urls]);
          }
        }
      } catch (err) {
        console.error('FilmRoll fetch error:', err);
      }
    };
    fetchPhotos();
  }, []);

  if (photos.length === 0) return null;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden opacity-10 pointer-events-none select-none">
      {/* Film Strip Container */}
      <div className="absolute top-1/2 left-0 flex -translate-y-1/2 gap-4 animate-film-scroll whitespace-nowrap py-10">
        {photos.map((url, idx) => (
          <div 
            key={idx} 
            className="relative h-64 w-44 flex-shrink-0 border-y-[12px] border-black bg-black p-1 shadow-2xl"
          >
            {/* Film Sprocket Holes (Atas) */}
            <div className="absolute top-[-10px] left-0 right-0 flex justify-around px-1">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-2 w-3 rounded-sm bg-[#2D2D2D]"></div>
              ))}
            </div>

            {/* The Photo */}
            <img 
              src={url} 
              alt="memory" 
              className="h-full w-full object-cover grayscale brightness-75 contrast-125"
            />

            {/* Film Sprocket Holes (Bawah) */}
            <div className="absolute bottom-[-10px] left-0 right-0 flex justify-around px-1">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-2 w-3 rounded-sm bg-[#2D2D2D]"></div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Vignette Overlay untuk efek dramatis */}
      <div className="absolute inset-0 bg-radial-vignette pointer-events-none"></div>
    </div>
  );
}
