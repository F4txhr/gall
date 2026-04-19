'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const HeartSVG = () => (
  <svg viewBox="0 0 32 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 28.5L14.1 26.8C7.3 20.6 2.8 16.5 2.8 11.5C2.8 7.4 6 4.2 10.1 4.2C12.4 4.2 14.6 5.3 16 7C17.4 5.3 19.6 4.2 21.9 4.2C26 4.2 29.2 7.4 29.2 11.5C29.2 16.5 24.7 20.6 17.9 26.8L16 28.5Z" />
  </svg>
);

const IloveYouSVG = () => (
  <svg viewBox="0 0 100 30" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <text x="0" y="20" fontSize="14" fontWeight="bold" fontFamily="serif italic">i love you</text>
  </svg>
);

const types = [
  { component: HeartSVG, color: '#FF69B4' }, // Pink
  { component: HeartSVG, color: '#FFD700' }, // Gold
  { component: IloveYouSVG, color: '#FF1493' }, // Deep Pink
  { component: HeartSVG, color: '#FF8C00' }, // Orange
];

export function FloatingHearts() {
  const [elements, setElements] = useState<any[]>([]);

  useEffect(() => {
    const newElements = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      type: types[Math.floor(Math.random() * types.length)],
      size: Math.random() * (40 - 20) + 20,
      delay: Math.random() * 10,
      duration: Math.random() * (20 - 12) + 12,
    }));
    setElements(newElements);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[-5] select-none opacity-30">
      {elements.map((el) => {
        const SvgComponent = el.type.component;
        return (
          <motion.div
            key={el.id}
            initial={{ y: '110vh', x: `${el.x}vw`, opacity: 0 }}
            animate={{
              y: '-20vh',
              opacity: [0, 1, 1, 0],
              rotate: [0, 30, -30, 0],
            }}
            transition={{
              duration: el.duration,
              repeat: Infinity,
              delay: el.delay,
              ease: 'linear',
            }}
            style={{
              position: 'absolute',
              width: `${el.size}px`,
              color: el.type.color,
              filter: `drop-shadow(0 0 8px ${el.type.color}66)`,
            }}
          >
            <SvgComponent />
          </motion.div>
        );
      })}
    </div>
  );
}
