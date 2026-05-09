'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { relationshipConfig, getCelebrationStatus } from '@/lib/relationship';
import { FallingMemories } from '@/components/overlays/FallingMemories';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type Step = 'idle' | 'waiting_partner' | 'intro' | 'wish' | 'showcase' | 'completed';

export function CelebrationFlow({ config }: { config?: any }) {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>('idle');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [partnerOnline, setPartnerOnline] = useState(false);
  const [partnerName, setPartnerName] = useState('');
  
  const [introText, setIntroText] = useState('');
  const [wishInput, setWishInput] = useState('');
  const [partnerWish, setPartnerWish] = useState('');
  const [introAiMessage, setIntroAiMessage] = useState('');
  const [finalAiMessage, setFinalAiMessage] = useState('');
  const [displayedText, setDisplayedText] = useState('');
  
  const [isTyping, setIsTyping] = useState(false);
  const [introTypingDone, setIntroTypingDone] = useState(false);
  const [showcaseTypingDone, setShowcaseTypingDone] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const forcedTest = searchParams.get('celebrate') === '1';
  const forcedType = searchParams.get('type') as 'birthday' | 'anniversary' | null;

  const status = useMemo(() => {
    if (forcedTest && forcedType) {
      return { 
        type: forcedType, 
        years: forcedType === 'birthday' ? 20 : 2, 
        name: forcedType === 'birthday' ? (config?.partnerB || relationshipConfig.partnerB) : 'Kita' 
      };
    }
    const currentConfig = config || relationshipConfig;
    return getCelebrationStatus(currentConfig);
  }, [config, forcedTest, forcedType]);

  const isAnniv = status?.type === 'anniversary';
  const shouldShow = !!status || forcedTest;

  useEffect(() => {
    if (!supabase) return;
    fetch('/api/me').then(res => res.json()).then(data => {
        setUserRole(data.role);
        const pName = data.role === 'cowo' ? (data.settings?.partnerB || relationshipConfig.partnerB) : (data.settings?.partnerA || relationshipConfig.partnerA);
        setPartnerName(pName);
    });
  }, []);

  useEffect(() => {
    if (!supabase || !userRole) return;

    const channel = supabase.channel(`celeb-realtime-${userRole}`);

    // 1. DAFTARKAN SEMUA HANDLER SEBELUM SUBSCRIBE
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const partnerRole = userRole === 'cowo' ? 'cewe' : 'cowo';
        const isOnline = Object.values(state).some((presences: any) => 
          presences.some((p: any) => p.role === partnerRole)
        );
        setPartnerOnline(isOnline);
      })
      .on('broadcast', { event: 'celebration_invitation' }, ({ payload }) => {
        if (payload.role !== userRole && step === 'idle') {
           console.log("Pasangan sudah mulai merayakan!");
        }
      })
      .on('broadcast', { event: 'wish_submitted' }, ({ payload }) => {
          if (payload.role !== userRole) setPartnerWish(payload.text);
      });

    // 2. BARU SUBSCRIBE
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({ role: userRole, joined_at: new Date().toISOString() });
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userRole, step]);

  const startSequence = async () => {
    setStep('intro');
    fetch('/api/celebrate/notify', { method: 'POST', body: JSON.stringify({ action: 'celebration_started', senderRole: userRole }) });
    
    // Broadcast via default channel
    supabase?.channel('celeb-broadcast').send({
        type: 'broadcast',
        event: 'celebration_invitation',
        payload: { role: userRole }
    });

    await generateIntro();
    const audioUrl = isAnniv ? '/audio/anniversary.mp3' : '/audio/birthday.mp3';
    audioRef.current = new Audio(audioUrl);
    audioRef.current.loop = true;
    try { await audioRef.current.play(); } catch (e) { }
    confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 } });
  };

  useEffect(() => {
    if (step === 'intro' && introAiMessage && !introTypingDone) { 
      setIntroText(''); setIsTyping(true);
      let i = 0;
      const interval = setInterval(() => {
        i++; setIntroText(introAiMessage.slice(0, i));
        if (i >= introAiMessage.length) { clearInterval(interval); setIsTyping(false); setIntroTypingDone(true); }
      }, 60); 
      return () => clearInterval(interval);
    }
  }, [step, introAiMessage, introTypingDone]);

  useEffect(() => {
    if (step === 'showcase' && finalAiMessage && !showcaseTypingDone) {
      setDisplayedText(''); setIsTyping(true);
      let i = 0;
      const interval = setInterval(() => {
        i++; setDisplayedText(finalAiMessage.slice(0, i));
        if (i >= finalAiMessage.length) { clearInterval(interval); setIsTyping(false); setShowcaseTypingDone(true); setTimeout(() => setStep('completed'), 15000); }
      }, 40);
      return () => clearInterval(interval);
    }
  }, [step, finalAiMessage, showcaseTypingDone]);

  const generateIntro = async () => {
    setIntroAiMessage(''); setIsLoading(true);
    const res = await fetch('/api/ai/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: isAnniv ? 'Sayang' : status?.name, context: isAnniv ? 'ANNIV' : 'ULTAH', maxWords: 50 }),
    });
    const data = await res.json();
    setIntroAiMessage(data.text); setIsLoading(false);
  };

  const generateFinalShowcase = async () => {
    setFinalAiMessage(''); setIsLoading(true);
    const res = await fetch('/api/ai/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: isAnniv ? 'Sayang' : status?.name, context: 'SURAT CINTA FINAL', maxWords: 200 }),
    });
    const data = await res.json();
    setFinalAiMessage(data.text); setStep('showcase'); setIsLoading(false);
  };

  const submitWish = async () => {
    if (!wishInput.trim()) return;
    setIsLoading(true);
    if (isAnniv) {
      supabase?.channel('celeb-broadcast').send({ type: 'broadcast', event: 'wish_submitted', payload: { role: userRole, text: wishInput } });
      if (!partnerWish) { setStep('waiting_partner'); return; }
    }
    fetch('/api/celebrate/notify', { method: 'POST', body: JSON.stringify({ action: 'wish_submitted', senderRole: userRole }) });
    generateFinalShowcase();
  };

  if (!shouldShow) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center overflow-hidden bg-bucin-bg/95 backdrop-blur-xl">
      <AnimatePresence>
        {partnerOnline && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="fixed top-10 left-1/2 -translate-x-1/2 z-[600] flex items-center gap-2 rounded-full bg-white/10 border border-white/10 px-4 py-1.5 backdrop-blur-md">
                <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span></span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">{partnerName} sedang melihat ini... ✨</span>
            </motion.div>
        )}
      </AnimatePresence>
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-6">
        <AnimatePresence mode="wait">
          {step === 'idle' && (
            <motion.div key="idle" className="text-center space-y-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="animate-pulse text-6xl md:text-8xl">🎁</div>
              <h2 className="glow-gold text-3xl md:text-5xl font-bold text-bucin-gold">Ada Kejutan Untukmu...</h2>
              <button onClick={startSequence} className="rounded-2xl bg-bucin-pink px-10 py-4 text-xl font-bold text-white shadow-lg shadow-bucin-pink/20 hover:scale-110 transition-transform">Buka Sekarang ✨</button>
            </motion.div>
          )}
          {step === 'waiting_partner' && (
            <motion.div key="waiting" className="text-center space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-bucin-gold border-t-transparent" />
              <p className="text-xl text-white italic">Menunggu pasanganmu mengirimkan doanya juga...</p>
              {partnerOnline && <p className="text-sm text-bucin-gold animate-bounce">Dia sedang online! Sebentar lagi...</p>}
            </motion.div>
          )}
          {step === 'intro' && (
            <motion.div key="intro" className="text-center max-w-3xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
               <div className="text-3xl md:text-5xl font-serif italic text-white leading-relaxed glow-pink">
                  {!introAiMessage ? 'Meresapi waktu...' : (<>“{introText}<span className={`inline-block w-[3px] h-[0.7em] bg-bucin-pink ml-1 ${isTyping ? 'opacity-100' : 'animate-pulse'}`}></span>”</>)}
               </div>
               {introAiMessage && introTypingDone && (<button onClick={() => setStep('wish')} className="mt-12 rounded-xl border border-white/20 px-8 py-3 text-white/60">Lanjutkan ➔</button>)}
            </motion.div>
          )}
          {step === 'wish' && (
            <motion.div key="wish" className="w-full max-w-xl text-center space-y-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h3 className="text-3xl font-bold text-white">{isAnniv ? 'Tulis Doa untuk Kita' : `Tulis Doa untuk ${status?.name}`}</h3>
              <textarea value={wishInput} onChange={e => setWishInput(e.target.value)} className="w-full h-40 rounded-3xl bg-white/5 border border-white/10 p-6 text-white outline-none focus:border-bucin-pink text-lg" placeholder="Tulis harapan terdalammu di sini..." />
              <button onClick={submitWish} disabled={isLoading || !wishInput.trim()} className="w-full rounded-2xl bg-bucin-gold py-4 text-xl font-bold text-bucin-bg disabled:opacity-50">{isLoading ? 'Mengirim doa...' : 'Kirim Doa 💖'}</button>
            </motion.div>
          )}
          {step === 'showcase' && (
            <motion.div key="showcase" className="absolute inset-0 flex flex-col items-center justify-center p-8 md:p-20 overflow-hidden">
               <div className="absolute inset-0 z-10 opacity-40"><FallingMemories /></div>
               <div ref={scrollRef} className="z-20 text-center max-w-4xl max-h-[80vh] overflow-y-auto custom-scrollbar pr-4 scroll-smooth">
                  <div className="text-2xl md:text-4xl font-serif italic text-white leading-relaxed glow-pink">
                    {!finalAiMessage ? 'Meresapi doa...' : <>{displayedText}<span className={`inline-block w-[3px] h-[0.7em] bg-bucin-pink ml-2 ${isTyping ? 'opacity-100' : 'animate-pulse'}`}></span></>}
                  </div>
                  {!isTyping && finalAiMessage && <div className="mt-12 animate-bounce text-4xl">{isAnniv ? '💑🥂💖' : '🎈🎂🎉'}</div>}
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
