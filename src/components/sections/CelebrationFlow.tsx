'use client';

import { useMemo, useState } from 'react';

type Step = 1 | 2 | 3 | 4 | 5;

const STORAGE_KEY = 'web_bucin_wishes';

export function CelebrationFlow(): JSX.Element {
  const [step, setStep] = useState<Step>(1);
  const [wishInput, setWishInput] = useState('');
  const [savedWish, setSavedWish] = useState('');
  const [candleOff, setCandleOff] = useState(false);

  const stepTitle = useMemo(() => {
    switch (step) {
      case 1:
        return 'Step 1: Ucapan';
      case 2:
        return 'Step 2: Lihat Kejutan';
      case 3:
        return 'Step 3: Kue + Lilin';
      case 4:
        return 'Step 4: Make a Wish';
      case 5:
        return 'Step 5: Tiup Lilin';
      default:
        return '';
    }
  }, [step]);

  const nextStep = (): void => {
    setStep((prev) => (prev < 5 ? ((prev + 1) as Step) : prev));
  };

  const saveWish = (): void => {
    if (!wishInput.trim()) return;

    const old = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as string[];
    const updated = [wishInput.trim(), ...old].slice(0, 20);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setSavedWish(wishInput.trim());
    setWishInput('');
    setStep(5);
  };

  return (
    <section className="flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center">
      <h2 className="text-3xl font-semibold md:text-4xl">Birthday / Anniversary Celebration</h2>
      <p className="mt-3 text-bucin-textSecondary">Flow perayaan sesuai roadmap: ucapan → kejutan → kue → wish → tiup lilin.</p>

      <div className="mt-8 w-full max-w-2xl rounded-2xl bg-bucin-card p-6 shadow-xl">
        <p className="text-sm uppercase tracking-wide text-bucin-textSecondary">{stepTitle}</p>

        {step === 1 ? (
          <div className="mt-4 space-y-4">
            <p className="text-lg">Selamat merayakan hari spesial ya 💛</p>
            <button type="button" onClick={nextStep} className="rounded-lg bg-bucin-gold px-4 py-2 font-semibold text-bucin-bg">
              Lanjut
            </button>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="mt-4 space-y-4">
            <p>Siap untuk lihat kejutan kecil dari Web Bucin?</p>
            <button type="button" onClick={nextStep} className="rounded-lg bg-bucin-gold px-4 py-2 font-semibold text-bucin-bg">
              Lihat Kejutan
            </button>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="mt-4 flex flex-col items-center gap-4">
            <div className="relative">
              <div className="mx-auto h-4 w-2 rounded bg-[#F5E6A1]" />
              {!candleOff ? (
                <div className="mx-auto h-4 w-4 rounded-full bg-gradient-to-b from-[#FFD166] via-[#FF9B5C] to-[#FF6B35] shadow-[0_0_20px_#FF9B5C]" />
              ) : (
                <div className="mx-auto h-4 w-4 rounded-full bg-slate-500/70" />
              )}
              <div className="mt-2 h-24 w-56 rounded-t-[4rem] border-4 border-bucin-gold bg-bucin-brown" />
            </div>
            <button type="button" onClick={nextStep} className="rounded-lg bg-bucin-gold px-4 py-2 font-semibold text-bucin-bg">
              Lanjut Make a Wish
            </button>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="mt-4 space-y-4 text-left">
            <label className="block text-sm text-bucin-textSecondary">Tulis wish kamu:</label>
            <textarea
              value={wishInput}
              onChange={(e) => setWishInput(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-bucin-hover bg-bucin-bg p-3 text-bucin-text"
              placeholder="Semoga kita selalu sehat, langgeng, dan saling jaga..."
            />
            <button type="button" onClick={saveWish} className="rounded-lg bg-bucin-gold px-4 py-2 font-semibold text-bucin-bg">
              Simpan Wish
            </button>
          </div>
        ) : null}

        {step === 5 ? (
          <div className="mt-4 space-y-4">
            <p>Tiup lilinnya sekarang 🎂</p>
            <button
              type="button"
              onClick={() => setCandleOff(true)}
              className="rounded-lg bg-bucin-gold px-4 py-2 font-semibold text-bucin-bg"
            >
              Tiup Lilin (klik)
            </button>
            {candleOff ? <p className="text-bucin-gold">Yay! Lilin padam, semoga wish kamu terkabul ✨</p> : null}
            {savedWish ? <p className="text-bucin-textSecondary">Wish terakhir: “{savedWish}”</p> : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
