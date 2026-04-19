'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { relationshipConfig, getCelebrationStatus } from '@/lib/relationship';
import { FallingMemories } from '@/components/overlays/FallingMemories';
import { PresenceSilhouette } from '@/components/overlays/PresenceSilhouette';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type Step = 'idle' | 'waiting_partner' | 'intro' | 'wish' | 'showcase' | 'completed';

export function CelebrationFlow(): JSX.Element | null {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>('idle');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [partnerOnline, setPartnerOnline] = useState(false);
  
  const [introText, setIntroText] = useState('');
  const [wishInput, setWishInput] = useState('');
  const [partnerWish, setPartnerWish] = useState('');
  const [aiMessage, setAiMessage] = useState('');
  const [displayedText, setDisplayedText] = useState('');
  
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const forcedTest = searchParams.get('celebrate') === '1';
  const forcedType = searchParams.get('type') as 'birthday' | 'anniversary' | null;

  const status = useMemo(() => {
    if (forcedTest && forcedType) {
      return { 
        type: forcedType, 
        years: forcedType === 'birthday' ? 20 : 2, 
        name: forcedType === 'birthday' ? relationshipConfig.partnerB : 'Kita' 
      };
    }
    return getCelebrationStatus(relationshipConfig);
  }, [forcedTest, forcedType]);

  const isAnniv = status?.type === 'anniversary';
  const shouldShow = !!status || forcedTest;

  useEffect(() => {
    if (!supabase || !shouldShow) return;

    fetch('/api/me').then(res => res.json()).then(data => setUserRole(data.role));

    const channel = supabase.channel('sync_room');
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const pRole = userRole === 'cowo' ? 'cewe' : 'cowo';
        const isOnline = !!state[pRole];
        setPartnerOnline(isOnline);

        if (isAnniv && isOnline && step === 'idle') {
           setTimeout(() => startSequence(), 1000);
        }
      })
      .on('broadcast', { event: 'partner_wish' }, ({ payload }) => {
        setPartnerWish(payload.wish);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED' && userRole) {
          await channel.track({ online_at: new Date().toISOString() });
        }
      });

    return () => { channel.unsubscribe(); };
  }, [shouldShow, userRole, step, isAnniv]);

  useEffect(() => {
    if (step === 'showcase' && aiMessage) {
      setDisplayedText(''); // Reset displayed text for new message
      let i = 0;
      const interval = setInterval(() => {
        setDisplayedText(aiMessage.slice(0, i));
        i++;
        if (i > aiMessage.length) {
          clearInterval(interval);
          setTimeout(() => setStep('completed'), 15000);
        }
      }, 55);
      return () => clearInterval(interval);
    }
  }, [step, aiMessage]);

  const generateIntro = async () => {
    setIsLoading(true);
    const contextStr = isAnniv 
      ? `BUAT INTRO ANNIV: Hari ini Anniversary ke-${status?.years}. Buat kata-kata pembuka yang sangat puitis, kaget waktu cepat berlalu, penuh haru, dan menyentuh hati. Gunakan sapaan romantis. Max 35 kata.`
      : `BUAT INTRO ULTAH: Hari ini Ulang Tahun ke-${status?.years} untuk ${status?.name}. Buat kata-kata kaget dia sudah bertambah dewasa, penuh syukur, dan sangat kagum padanya. Gunakan sapaan romantis dan kata "kamu". Max 35 kata.`;

    const res = await fetch('/api/ai/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: isAnniv ? 'Sayang' : status?.name,
        context: contextStr
      }),
    });
    const data = await res.json();
    setAiMessage(data.text);
    setIsLoading(false);
  };

  useEffect(() => {
    if (step === 'intro' && aiMessage && !isTyping) { // Only type if not already typing
      setIntroText(''); // Reset intro text for new message
      setIsTyping(true);
      let i = 0;
      const interval = setInterval(() => {
        setIntroText(aiMessage.slice(0, i));
        i++;
        if (i > aiMessage.length) {
          clearInterval(interval);
          setIsTyping(false); // Selesai mengetik intro
          if (isAnniv) {
            setTimeout(() => setStep('wish'), 3000); // Jeda 3 detik setelah intro selesai diketik
          } else {
             // Untuk ultah, langsung ke wish setelah intro selesai
             setTimeout(() => setStep('wish'), 3000);
          }
        }
      }, 60); // Kecepatan mengetik intro
      return () => clearInterval(interval);
    }
  }, [step, aiMessage, isAnniv, isTyping]);


  const startSequence = async () => {
    setStep('idle'); // Balik ke idle dulu untuk reset state
    await generateIntro(); // Langsung generate intro
    setStep('intro'); // Pindah ke intro
    // Play Audio (dipindah ke sini agar bisa dimainkan saat intro sudah muncul)
    const audioUrl = status?.type === 'anniversary' ? '/audio/anniversary.mp3' : '/audio/birthday.mp3';
    audioRef.current = new Audio(audioUrl);
    audioRef.current.loop = true;
    try { await audioRef.current.play(); } catch (e) { console.warn("Audio blocked", e); }

    confetti({
      particleCount: 200,
      spread: 100,
      origin: { y: 0.5 },
      colors: ['#FF69B4', '#FFD700', '#F5F0EB']
    });
  };

  const callPartner = async () => {
    await fetch('/api/celebrate/notify', {
      method: 'POST',
      body: JSON.stringify({ action: 'call_partner', senderRole: userRole })
    });
    alert('Notifikasi panggilan sudah dikirim ke Telegram! ✨');
  };

  const submitWish = async () => {
    if (!wishInput.trim()) return;
    
    // Simpan wish ke Supabase (atau localStorage jika tidak ada Supabase)
    // if (supabase) { ... } // Implementasi nanti

    // Kirim wish ke pasangan via broadcast
    if (isAnniv) {
      supabase?.channel('sync_room').send({
        type: 'broadcast',
        event: 'partner_wish',
        payload: { wish: wishInput }
      });

      if (!partnerWish) {
        setIsLoading(true);
        return;
      }
    }
    
    generateFinalShowcase();
  };

  useEffect(() => {
    if (step === 'wish' && isAnniv && partnerWish && wishInput && isLoading) {
      generateFinalShowcase();
    }
  }, [partnerWish, isAnniv, wishInput, isLoading]);

  const generateFinalShowcase = async () => {
    setIsLoading(true);
    const combinedWishes = isAnniv 
      ? `Wish dari aku: "${wishInput}" dan wish dari pasanganku: "${partnerWish}"`
      : `Wish hari ini: "${wishInput}"`;

    const contextStr = isAnniv
      ? `SURAT CINTA ANNIV: Rayakan Anniversary ke-${status?.years}. Sapaan romantis, masukkan elemen wish ini: ${combinedWishes}. Tulis surat puitis sangat panjang (min 150 kata), emosional, banyak doa 'Semoga...'. Akhiri dengan 'Happy Anniversary Sayang'.`
      : `SURAT CINTA ULTAH: Rayakan Ulang Tahun ke-${status?.years} untuk ${status?.name}. Sapaan romantis, masukkan elemen wish ini: ${combinedWishes}. Tulis surat puitis sangat panjang (min 150 kata), emosional, banyak doa 'Semoga...'. Akhiri dengan 'Happy Birthday Sayang'.`;

    const res = await fetch('/api/ai/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: isAnniv ? 'Sayang' : status?.name,
        context: contextStr
      }),
    });
    const data = await res.json();
    setAiMessage(data.text);
    
    // Play Audio (Sudah di startSequence, tidak perlu ulang)
    // audioRef.current = new Audio(audioUrl);
    // audioRef.current.loop = true;
    // audioRef.current.play().catch(() => {});

    setStep('showcase');
    setIsLoading(false);
  };

  const eventName = status?.type === 'anniversary' ? 'Anniversary' : 'Ulang Tahun';
  const eventYears = status?.years || 0;
  const targetName = status?.type === 'birthday' ? (status as any).name : 'Kita';

  if (!shouldShow) return null;

  return (
    <div className="relative">
      <AnimatePresence>
        {step !== 'completed' && (
          <motion.div className="fixed inset-0 z-[9999] bg-[#030303] overflow-hidden flex items-center justify-center px-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {partnerOnline && <PresenceSilhouette role={userRole === 'cowo' ? 'cewe' : 'cowo'} />}

            <AnimatePresence mode="wait">
              {step === 'idle' && (
                <motion.div key="idle" className="text-center" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                  <h2 className="glow-pink text-4xl md:text-6xl font-bold text-bucin-pink mb-10">Momen Indah Menanti... ✨</h2>
                  <div className="flex flex-col gap-4">
                    <button onClick={startSequence} className="rounded-full bg-gradient-to-r from-bucin-pink to-bucin-rose px-12 py-5 text-xl font-bold text-white shadow-2xl hover:scale-105 transition-transform">Buka Kejutan 💖</button>
                    {!isAnniv && !partnerOnline && (
                      <button onClick={callPartner} className="text-bucin-gold text-sm underline opacity-70">Panggil pasangan untuk melihat ini bersama ➔</button>
                    )}
                  </div>
                </motion.div>
              )}

              {step === 'waiting_partner' && (
                <motion.div key="waiting" className="text-center max-w-lg" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="mb-8 flex justify-center"><span className="relative flex h-12 w-12"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-bucin-pink opacity-75"></span><span className="relative inline-flex rounded-full h-12 w-12 bg-bucin-pink"></span></span></div>
                  <h3 className="text-2xl font-bold text-white mb-4">Menunggu Pasanganmu...</h3>
                  <p className="text-bucin-textSecondary leading-relaxed">Khusus Anniversary, perayaan ini akan jauh lebih indah jika dibuka bersama-sama. <br/>Minta dia buka web ini sekarang ya! ✨</p>
                  {partnerOnline && <button onClick={generateIntro} className="mt-8 text-bucin-gold font-bold animate-bounce">Dia sudah online! Klik untuk Mulai ➔</button>}
                </motion.div>
              )}

              {step === 'intro' && (
                <motion.div key="intro" className="text-center max-w-3xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                   <div className="text-3xl md:text-5xl font-serif italic text-white leading-relaxed glow-pink">
                      {isLoading ? 'Meresapi waktu...' : `“${introText}”`}
                      <span className="inline-block w-1 h-8 bg-bucin-pink animate-pulse ml-2"></span> {/* Ukuran cursor kecil */}
                   </div>
                   {!isLoading && ( // Tombol Lanjutkan muncul setelah intro selesai diketik
                     <button onClick={() => isAnniv ? setStep('wish') : setStep('wish')} className="mt-12 rounded-xl border border-white/20 px-8 py-3 text-white/60">Lanjutkan ➔</button>
                   )}
                </motion.div>
              )}

              {step === 'wish' && (
                <motion.div key="wish" className="w-full max-w-xl text-center" initial={{ y: 20 }} animate={{ y: 0 }}>
                   <h3 className="text-3xl font-bold text-bucin-pink mb-10 glow-pink">
                      {isAnniv ? 'Satu Doa untuk Kita Berdua...' : `Satu Doa untukmu, ${targetName}...`}
                   </h3>
                   <textarea value={wishInput} onChange={(e) => setWishInput(e.target.value)} placeholder="Tuliskan harapanmu..." className="w-full h-44 rounded-3xl border-2 border-white/10 bg-white/5 p-8 text-xl text-white outline-none focus:border-bucin-pink transition-all resize-none" />
                   <button onClick={submitWish} disabled={isLoading} className="mt-8 w-full rounded-2xl bg-bucin-pink py-5 text-xl font-bold text-white shadow-xl">
                      {isLoading ? (isAnniv ? 'Menunggu Doa Pasangan...' : 'Merangkai Doa...') : 'Kirim Doa ✨'}
                   </button>
                   {isAnniv && partnerWish && <p className="mt-4 text-sm text-bucin-gold animate-pulse">✨ Pasanganmu sudah mengirim doanya!</p>}
                </motion.div>
              )}

              {step === 'showcase' && (
                <motion.div key="showcase" className="absolute inset-0 flex flex-col items-center justify-center p-8 md:p-20 overflow-hidden">
                   <div className="absolute inset-0 z-10 opacity-40"><FallingMemories /></div>
                   <div className="z-20 text-center max-w-4xl max-h-[80vh] overflow-y-auto custom-scrollbar pr-4">
                      <div className="text-2xl md:text-4xl font-serif italic text-white leading-relaxed glow-pink">
                        {displayedText}
                        <span className="inline-block w-1 h-8 bg-bucin-pink animate-pulse ml-3"></span>
                      </div>
                      {!isTyping && <div className="mt-12 animate-bounce text-4xl">{isAnniv ? '💑🥂💖' : '🎈🎂🎉'}</div>}
                   </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {step === 'completed' && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[50]">
          <button onClick={() => { setStep('idle'); setDisplayedText(''); }} className="card-bucin px-8 py-3 font-bold text-bucin-pink">Putar Ulang Rekaman 💫</button>
        </div>
      )}
    </div>
  );
}
