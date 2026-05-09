'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getLiveSettings } from '@/lib/relationship';

export function FloatingMusicPlayer() {
  const [musicUrl, setMusicUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVisible, setIsHidden] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Ambil URL musik resmi
    const fetchMusic = async () => {
      const settings = await getLiveSettings();
      if (settings.musicUrl) {
        setMusicUrl(settings.musicUrl);
      }
    };
    fetchMusic();

    // Sembunyikan jika overlay aktif (sama seperti navbar)
    const checkOverlays = () => {
      setIsHidden(document.body.style.overflow === 'hidden');
    };
    const observer = new MutationObserver(checkOverlays);
    observer.observe(document.body, { attributes: true, attributeFilter: ['style'] });
    return () => observer.disconnect();
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {
        alert('Klik di mana saja pada layar dulu, baru putar musik (Kebijakan Browser).');
      });
    }
    setIsPlaying(!isPlaying);
  };

  if (!musicUrl || isVisible) return <></>;

  return (
    <div className="fixed bottom-6 right-6 z-[90]">
      <audio ref={audioRef} src={musicUrl} loop />
      
      <motion.button
        onClick={togglePlay}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={`relative flex h-14 w-14 items-center justify-center rounded-full shadow-2xl transition-colors ${
          isPlaying ? 'bg-bucin-pink' : 'bg-white/10 backdrop-blur-md border border-white/20'
        }`}
      >
        {/* Disk Rotation Animation */}
        <motion.div
          animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
          transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
          className={`flex items-center justify-center rounded-full border-2 border-white/20 ${isPlaying ? 'opacity-100' : 'opacity-40'}`}
        >
           <span className="text-2xl">🎵</span>
        </motion.div>

        {/* Pulse effect when playing */}
        {isPlaying && (
          <span className="absolute inset-0 animate-ping rounded-full bg-bucin-pink opacity-20"></span>
        )}
      </motion.button>
      
      {/* Tooltip on hover */}
      <div className="absolute bottom-full right-0 mb-3 whitespace-nowrap rounded-lg bg-black/60 px-3 py-1 text-[10px] text-white opacity-0 transition-opacity hover:opacity-100 pointer-events-none border border-white/10 backdrop-blur-sm">
        {isPlaying ? 'Matiin Musik' : 'Putar Lagu Kita 💖'}
      </div>
    </div>
  );
}
