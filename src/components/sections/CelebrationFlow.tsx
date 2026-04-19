'use client';

import { useEffect, useMemo, useState } from 'react';
import { relationshipConfig } from '@/lib/relationship';

type Step = 'start' | 'message' | 'wish' | 'memories';

const STORAGE_WISH = 'web_bucin_wishes';
const STORAGE_MEMORIES = 'web_bucin_memories';

function getInitialMemories(): string[] {
  if (typeof window === 'undefined') return [];

  const fromStorage = JSON.parse(localStorage.getItem(STORAGE_MEMORIES) ?? '[]') as string[];
  if (fromStorage.length > 0) return fromStorage;

  const seeded = (process.env.NEXT_PUBLIC_MEMORY_IMAGE_URLS ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  if (seeded.length > 0) {
    localStorage.setItem(STORAGE_MEMORIES, JSON.stringify(seeded));
  }

  return seeded;
}

export function CelebrationFlow(): JSX.Element {
  const [step, setStep] = useState<Step>('start');
  const [wishInput, setWishInput] = useState('');
  const [savedWish, setSavedWish] = useState('');
  const [message, setMessage] = useState('');
  const [generating, setGenerating] = useState(false);
  const [memories, setMemories] = useState<string[]>([]);
  const [slideIndex, setSlideIndex] = useState(0);

  const birthdayName = relationshipConfig.partnerB;

  useEffect(() => {
    setMemories(getInitialMemories());
  }, []);

  useEffect(() => {
    if (step !== 'memories' || memories.length === 0) return;

    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % memories.length);
    }, 2500);

    return () => clearInterval(timer);
  }, [step, memories]);

  const generateMessage = async (): Promise<void> => {
    setGenerating(true);
    const res = await fetch('/api/ai/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: birthdayName,
        context: 'Pasangan yang saling support dan sedang merayakan momen ulang tahun.',
      }),
    });

    setGenerating(false);
    if (!res.ok) return;
    const data = (await res.json()) as { text?: string };
    if (data.text) setMessage(data.text);
  };

  const startExperience = async (): Promise<void> => {
    const audioUrl = process.env.NEXT_PUBLIC_BIRTHDAY_AUDIO_URL;
    if (audioUrl) {
      try {
        const audio = new Audio(audioUrl);
        audio.volume = 0.7;
        await audio.play();
      } catch {
        // autoplay can be blocked by browser; continue silently
      }
    }

    await generateMessage();
    setStep('message');
  };

  const saveWish = (): void => {
    if (!wishInput.trim()) return;

    const old = JSON.parse(localStorage.getItem(STORAGE_WISH) ?? '[]') as string[];
    const updated = [wishInput.trim(), ...old].slice(0, 20);
    localStorage.setItem(STORAGE_WISH, JSON.stringify(updated));

    setSavedWish(wishInput.trim());
    setWishInput('');
    setStep('memories');
  };

  const headline = useMemo(() => {
    if (step === 'start') return 'Mulai momen spesial';
    if (step === 'message') return 'Kata-kata spesial untukmu';
    if (step === 'wish') return 'Make a Wish';
    return 'Kenangan kita ✨';
  }, [step]);

  return (
    <section className="flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center">
      <h2 className="text-3xl font-semibold md:text-4xl">Celebration Experience</h2>
      <p className="mt-3 max-w-2xl text-bucin-textSecondary">
        Tanpa kue pun tetap romantis: start lagu → kata-kata unik (AI) → make a wish → slideshow kenangan.
      </p>

      <div className="mt-8 w-full max-w-3xl rounded-3xl border border-bucin-textSecondary/20 bg-gradient-to-b from-[#4A4A4A] to-[#3d3d3d] p-7 shadow-2xl">
        <p className="text-sm uppercase tracking-[0.2em] text-bucin-textSecondary">{headline}</p>

        {step === 'start' ? (
          <div className="mt-6 space-y-4">
            <p className="text-bucin-textSecondary">
              Saat tombol start ditekan, musik diputar lalu kata-kata spesial AI akan muncul otomatis.
            </p>
            <button
              type="button"
              onClick={startExperience}
              className="rounded-xl bg-bucin-gold px-6 py-3 font-semibold text-bucin-bg"
            >
              Start Celebration
            </button>
          </div>
        ) : null}

        {step === 'message' ? (
          <div className="mt-6 space-y-5">
            <blockquote className="rounded-2xl border border-bucin-gold/30 bg-bucin-bg/40 p-5 text-left leading-relaxed">
              {generating ? 'Generating kata-kata romantis...' : `“${message}”`}
            </blockquote>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={generateMessage}
                className="rounded-xl border border-bucin-gold px-4 py-2 font-semibold text-bucin-text"
              >
                Generate lagi
              </button>
              <button
                type="button"
                onClick={() => setStep('wish')}
                className="rounded-xl bg-bucin-gold px-4 py-2 font-semibold text-bucin-bg"
              >
                Lanjut Make a Wish
              </button>
            </div>
          </div>
        ) : null}

        {step === 'wish' ? (
          <div className="mt-6 space-y-4 text-left">
            <label className="block text-sm text-bucin-textSecondary">Tulis wish kamu:</label>
            <textarea
              value={wishInput}
              onChange={(e) => setWishInput(e.target.value)}
              rows={4}
              className="w-full rounded-2xl border border-bucin-hover bg-bucin-bg p-3 text-bucin-text"
              placeholder="Semoga kita selalu sehat, langgeng, dan saling jaga..."
            />
            <button type="button" onClick={saveWish} className="rounded-xl bg-bucin-gold px-5 py-2.5 font-semibold text-bucin-bg">
              Simpan Wish & Tampilkan Kenangan
            </button>
          </div>
        ) : null}

        {step === 'memories' ? (
          <div className="mt-6 space-y-4">
            {savedWish ? <p className="text-bucin-textSecondary">Wish terakhir: “{savedWish}”</p> : null}

            {memories.length > 0 ? (
              <div className="mx-auto w-full max-w-xl overflow-hidden rounded-2xl border border-bucin-gold/30 bg-black/30 p-3">
                <img
                  src={memories[slideIndex]}
                  alt={`Kenangan ${slideIndex + 1}`}
                  className="h-[320px] w-full rounded-xl object-cover"
                />
                <p className="mt-3 text-sm text-bucin-textSecondary">
                  Slide {slideIndex + 1} / {memories.length}
                </p>
              </div>
            ) : (
              <p className="text-bucin-textSecondary">
                Belum ada foto kenangan. Nanti setelah upload fitur jadi, slideshow akan tampil otomatis di sini.
              </p>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}
