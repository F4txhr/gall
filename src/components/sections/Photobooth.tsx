'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import Link from 'next/link';

type DecorType = 'none' | 'hearts' | 'stars' | 'flowers' | 'doodles' | 'vintage';
type LayoutMode = 'strip' | 'grid';
type FacingMode = 'user' | 'environment';

const COLOR_PALETTE = [
  { name: 'White', value: '#ffffff', text: '#1a1a1a' },
  { name: 'Cream', value: '#fdf5e6', text: '#5d4037' },
  { name: 'Pink', value: '#ffe4e1', text: '#ad1457' },
  { name: 'Lavender', value: '#e6e6fa', text: '#4527a0' },
  { name: 'Mint', value: '#f0fff0', text: '#2e7d32' },
  { name: 'Dark', value: '#1a1a1a', text: '#ffffff' },
];

export function Photobooth({ userRole, partnerName }: { userRole: string | null, partnerName: string }) {
  const [hasPhoto, setHasPhoto] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [finalStrip, setFinalStrip] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  // New State for Camera Switch
  const [facingMode, setFacingMode] = useState<FacingMode>('user');

  const [selectedColor, setSelectedColor] = useState(COLOR_PALETTE[0]);
  const [decor, setDecor] = useState<DecorType>('hearts');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('strip');
  const [customLabel, setCustomLabel] = useState(`Special Day with ${partnerName}`);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!hasPhoto && !finalStrip) getVideo();
    return () => stopCamera();
  }, [hasPhoto, finalStrip, facingMode]); // Restart when facingMode changes

  const getVideo = () => {
    stopCamera(); // Pastikan kamera lama mati dulu
    navigator.mediaDevices.getUserMedia({ 
      video: { 
        width: { ideal: 1080 }, 
        height: { ideal: 1080 }, 
        facingMode: facingMode 
      } 
    })
      .then((s) => { 
        setStream(s); 
        if (videoRef.current) { videoRef.current.srcObject = s; videoRef.current.play(); } 
      })
      .catch((err) => console.error("Kamera Error: ", err));
  };

  const stopCamera = () => { if (stream) { stream.getTracks().forEach(t => t.stop()); setStream(null); } };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = 1080; canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      if (facingMode === 'user') {
        ctx.translate(1080, 0); ctx.scale(-1, 1); // Mirroring hanya untuk kamera depan
      }
      const size = Math.min(video.videoWidth, video.videoHeight);
      const sx = (video.videoWidth - size) / 2;
      const sy = (video.videoHeight - size) / 2;
      ctx.drawImage(video, sx, sy, size, size, 0, 0, 1080, 1080);
      setPhotos(prev => [...prev, canvas.toDataURL('image/jpeg', 0.9)]);
      
      const flash = document.createElement('div');
      flash.className = 'fixed inset-0 bg-white z-[700] opacity-100 transition-opacity duration-300';
      document.body.appendChild(flash);
      setTimeout(() => { flash.style.opacity = '0'; setTimeout(() => document.body.removeChild(flash), 300); }, 50);
    }
  };

  const startSession = async () => {
    if (isCapturing) return;
    setIsCapturing(true); setPhotos([]); setFinalStrip(null); setHasPhoto(false);
    for (let i = 0; i < 4; i++) {
      let count = 3;
      setCountdown(count);
      while (count > 0) { await new Promise(r => setTimeout(r, 1000)); count--; setCountdown(count > 0 ? count : null); }
      takePhoto();
      await new Promise(r => setTimeout(r, 800));
    }
    setIsCapturing(false);
  };

  useEffect(() => {
    if (photos.length === 4) generateResult();
  }, [photos, selectedColor, decor, customLabel, layoutMode]);

  const generateResult = async () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const p = 25; const imgS = 300; const fH = 120;
    if (layoutMode === 'strip') {
      canvas.width = imgS + (p * 2); canvas.height = (imgS * 4) + (p * 5) + fH;
    } else {
      canvas.width = (imgS * 2) + (p * 3); canvas.height = (imgS * 2) + (p * 3) + fH;
    }
    ctx.fillStyle = selectedColor.value;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const drawPhoto = async (src: string, x: number, y: number) => {
      const img = new Image(); img.src = src;
      await new Promise(r => img.onload = r);
      ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.15)'; ctx.shadowBlur = 15; ctx.shadowOffsetY = 5;
      ctx.drawImage(img, x, y, imgS, imgS); ctx.restore();
    };
    if (layoutMode === 'strip') {
      for (let i = 0; i < 4; i++) await drawPhoto(photos[i], p, p + (i * (imgS + p)));
    } else {
      await drawPhoto(photos[0], p, p); await drawPhoto(photos[1], p*2 + imgS, p);
      await drawPhoto(photos[2], p, p*2 + imgS); await drawPhoto(photos[3], p*2 + imgS, p*2 + imgS);
    }
    const drawDecor = (emoji: string, count: number) => {
        ctx.font = '22px serif'; ctx.textAlign = 'center';
        for(let i=0; i<count; i++) {
            const x = Math.random() * canvas.width; const y = Math.random() * canvas.height;
            ctx.save(); ctx.globalAlpha = 0.6; ctx.translate(x, y); ctx.rotate(Math.random() * Math.PI);
            ctx.fillText(emoji, 0, 0); ctx.restore();
        }
    };
    if (decor === 'hearts') ['❤️', '💖', '💕', '✨'].forEach(e => drawDecor(e, 8));
    if (decor === 'stars') ['⭐', '🌟', '✨', '☁️'].forEach(e => drawDecor(e, 10));
    if (decor === 'flowers') ['🌸', '🌼', '🌿', '🌱'].forEach(e => drawDecor(e, 8));
    if (decor === 'doodles') ['🎨', '✏️', '🌈', '☀️'].forEach(e => drawDecor(e, 6));
    if (decor === 'vintage') {
        ctx.fillStyle = 'rgba(0,0,0,0.03)'; for(let i=0; i<1000; i++) ctx.fillRect(Math.random()*canvas.width, Math.random()*canvas.height, 1, 1);
        ctx.fillStyle = 'rgba(212, 165, 116, 0.3)';
        [p, canvas.width-p-60].forEach(x => { ctx.save(); ctx.translate(x, p); ctx.rotate(0.2); ctx.fillRect(0,0,60,20); ctx.restore(); });
    }
    ctx.fillStyle = selectedColor.text; ctx.font = 'bold 20px "Dancing Script", cursive'; ctx.textAlign = 'center';
    ctx.fillText(customLabel.toUpperCase(), canvas.width / 2, canvas.height - 65);
    ctx.font = '10px sans-serif'; ctx.fillStyle = selectedColor.text + '88';
    ctx.fillText(new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }), canvas.width / 2, canvas.height - 40);
    setFinalStrip(canvas.toDataURL('image/png'));
    setHasPhoto(true); if (!finalStrip) confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    stopCamera();
  };

  const sendToTelegram = async () => {
    if (!finalStrip || isSending) return;
    setIsSending(true);
    try {
      await fetch('/api/celebrate/booth-send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ imageBase64: finalStrip, senderRole: userRole }) });
      alert('Terkirim! 💌');
    } finally { setIsSending(false); }
  };

  const reset = () => { setHasPhoto(false); setFinalStrip(null); setPhotos([]); getVideo(); };

  return (
    <div className="flex flex-col items-center justify-between bg-zinc-950 p-4 h-screen w-full overflow-hidden text-white font-sans">
      <div className="w-full pt-2">
        <h1 className="text-xl font-black tracking-tighter text-pink-500 text-center italic">BUCIN BOOTH PRO ✨</h1>
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-center gap-6 w-full max-w-6xl flex-1 overflow-hidden">
        
        <div className="relative w-full max-w-[320px] md:max-w-[380px] aspect-square bg-black rounded-[2rem] overflow-hidden border-2 border-zinc-800 shadow-2xl flex-shrink-0">
            <video 
              ref={videoRef} muted playsInline 
              style={{ 
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
                objectFit: 'cover', 
                transform: facingMode === 'user' ? 'scaleX(-1)' : 'none', // Mirroring hanya jika kamera depan
                display: hasPhoto ? 'none' : 'block' 
              }} 
            />
            
            {/* SWITCH CAMERA BUTTON */}
            {!hasPhoto && !isCapturing && (
              <button 
                onClick={toggleCamera}
                className="absolute top-4 left-4 z-50 bg-black/50 backdrop-blur-md border border-white/10 p-3 rounded-full hover:bg-white/20 transition-all active:scale-90 shadow-xl"
                title="Ganti Kamera"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <path d="M2.5 9a10.5 10.5 0 0 1 19 0"></path>
                  <polyline points="12 5 2.5 9 12 13"></polyline>
                  <path d="M21.5 15a10.5 10.5 0 0 1-19 0"></path>
                  <polyline points="12 20 21.5 16 12 12"></polyline>
                </svg>
              </button>
            )}

            {countdown && <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-50"><motion.span key={countdown} initial={{ scale: 3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-9xl font-black text-white italic">{countdown}</motion.span></div>}
            {finalStrip && <div className="absolute inset-0 bg-[#0a0a0a] flex items-center justify-center p-4 overflow-y-auto"><img src={finalStrip} className="max-h-full shadow-2xl border-[6px] border-white transition-all" alt="Result" /></div>}
            {!finalStrip && <div className="absolute bottom-0 left-0 w-full flex h-1.5 gap-0.5 z-20">{[0,1,2,3].map(i => (<div key={i} className={`flex-1 transition-all duration-500 ${photos.length > i ? 'bg-pink-500' : 'bg-white/10'}`} />))}</div>}
        </div>

        <div className="w-full max-w-[350px] flex flex-col gap-4 overflow-y-auto custom-scrollbar max-h-full pr-2">
          {!hasPhoto ? (
            <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] text-center">
              <h2 className="text-xl font-bold mb-2 italic">Ready? 📸</h2>
              <p className="text-white/40 text-xs mb-6">Sekarang bisa pakai kamera depan atau belakang lho!</p>
              <button onClick={startSession} disabled={isCapturing} className="w-full py-5 bg-pink-600 hover:bg-pink-500 rounded-full font-black text-lg shadow-xl active:scale-95 disabled:opacity-50">{isCapturing ? 'MENGAMBIL FOTO...' : 'MULAI POSE! 🚀'}</button>
              <Link href="/" className="block mt-6 text-zinc-600 text-[10px] uppercase font-bold hover:text-white tracking-widest transition-colors">Batal</Link>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 bg-white/5 p-5 rounded-[2.5rem] border border-white/10">
              <div className="space-y-4">
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-widest text-pink-500 mb-2 block">1. Warna Bingkai</label>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_PALETTE.map(c => (
                      <button key={c.name} onClick={() => setSelectedColor(c)} className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColor.name === c.name ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-50'}`} style={{ backgroundColor: c.value }} title={c.name} />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-widest text-pink-500 mb-2 block">2. Jenis Hiasan</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['none', 'hearts', 'stars', 'flowers', 'doodles', 'vintage'] as DecorType[]).map(d => (
                      <button key={d} onClick={() => setDecor(d)} className={`py-1.5 rounded-lg text-[9px] font-bold uppercase border transition-all ${decor === d ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'}`}>{d}</button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-widest text-pink-500 mb-2 block">3. Layout</label>
                    <select value={layoutMode} onChange={e => setLayoutMode(e.target.value as any)} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-[10px] text-white outline-none">
                      <option value="strip" className="bg-zinc-900">Strip (1x4)</option>
                      <option value="grid" className="bg-zinc-900">Grid (2x2)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-widest text-pink-500 mb-2 block">4. Teks</label>
                    <input type="text" value={customLabel} onChange={e => setCustomLabel(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-[10px] text-white outline-none focus:border-pink-500" />
                  </div>
                </div>
              </div>
              <div className="pt-2 space-y-2 border-t border-white/5">
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={reset} className="py-3 bg-zinc-900 rounded-xl font-bold border border-zinc-800 text-[10px] uppercase">Ulangi</button>
                  <button onClick={sendToTelegram} disabled={isSending} className="py-3 bg-pink-600 rounded-xl font-bold text-[10px] uppercase">{isSending ? '...' : 'Kirim Tele'}</button>
                </div>
                <button onClick={() => { const link = document.createElement('a'); link.download = `booth.png`; link.href = finalStrip!; link.click(); }} className="w-full py-3 bg-white text-black rounded-xl font-black text-xs uppercase tracking-tighter shadow-xl">Download Foto</button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
