'use client';

import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';

type Step = 1 | 2 | 3 | 4 | 5;

const STORAGE_KEY = 'web_bucin_wishes';

const stepLabels: Record<Step, string> = {
  1: 'Ucapan',
  2: 'Kejutan',
  3: 'Kue',
  4: 'Wish',
  5: 'Tiup Lilin',
};

function StepBadge({ activeStep, step }: { activeStep: Step; step: Step }): JSX.Element {
  const active = step <= activeStep;

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm font-bold transition ${
          active ? 'border-bucin-gold bg-bucin-gold text-bucin-bg' : 'border-bucin-textSecondary/40 text-bucin-textSecondary'
        }`}
      >
        {step}
      </div>
      <span className="text-xs text-bucin-textSecondary">{stepLabels[step]}</span>
    </div>
  );
}

function CakeVisual({ candleOff }: { candleOff: boolean }): JSX.Element {
  return (
    <div className="relative mx-auto mt-2 w-[280px]">
      <div className="absolute left-1/2 top-1 -translate-x-1/2">
        <div className="mx-auto h-10 w-2 rounded bg-[#F5E6A1]" />
        {!candleOff ? (
          <motion.div
            className="mx-auto h-6 w-6 rounded-full bg-gradient-to-b from-[#FFD166] via-[#FF9B5C] to-[#FF6B35] shadow-[0_0_24px_#FF9B5C]"
            animate={{ scale: [1, 1.08, 1], opacity: [0.95, 1, 0.95] }}
            transition={{ repeat: Infinity, duration: 0.9 }}
          />
        ) : (
          <div className="mx-auto h-6 w-6 rounded-full bg-slate-500/60" />
        )}
      </div>

      <div className="mt-14 h-14 rounded-t-[70px] border-4 border-[#D4A574] bg-[#8B6F47]" />
      <div className="h-5 rounded-b-2xl bg-[#C97B5A]" />
      <div className="mx-auto mt-3 h-2 w-56 rounded-full bg-bucin-text/20" />
    </div>
  );
}

export function CelebrationFlow(): JSX.Element {
  const [step, setStep] = useState<Step>(1);
  const [wishInput, setWishInput] = useState('');
  const [savedWish, setSavedWish] = useState('');
  const [candleOff, setCandleOff] = useState(false);

  const headline = useMemo(() => {
    switch (step) {
      case 1:
        return 'Selamat merayakan hari spesial 💛';
      case 2:
        return 'Ada kejutan kecil buat kamu';
      case 3:
        return 'Saatnya kue ulang tahun';
      case 4:
        return 'Tulis harapan terbaikmu';
      case 5:
        return 'Tiup lilinnya sekarang';
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
      <h2 className="text-3xl font-semibold md:text-4xl">Celebration Moment</h2>
      <p className="mt-3 max-w-2xl text-bucin-textSecondary">
        Saya poles tampilannya biar lebih clean: stepper, card elegan, dan visual kue yang lebih proper.
      </p>

      <div className="mt-8 flex flex-wrap items-start justify-center gap-4">
        <StepBadge activeStep={step} step={1} />
        <StepBadge activeStep={step} step={2} />
        <StepBadge activeStep={step} step={3} />
        <StepBadge activeStep={step} step={4} />
        <StepBadge activeStep={step} step={5} />
      </div>

      <motion.div
        key={step}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mt-8 w-full max-w-2xl rounded-3xl border border-bucin-textSecondary/20 bg-gradient-to-b from-[#4A4A4A] to-[#3d3d3d] p-7 shadow-2xl"
      >
        <p className="text-sm uppercase tracking-[0.2em] text-bucin-textSecondary">Step {step} · {stepLabels[step]}</p>
        <h3 className="mt-3 text-2xl font-semibold">{headline}</h3>

        {step === 1 ? (
          <div className="mt-6 space-y-4">
            <p className="text-bucin-textSecondary">Semoga harimu dipenuhi tawa, cinta, dan kebahagiaan tanpa batas.</p>
            <button type="button" onClick={nextStep} className="rounded-xl bg-bucin-gold px-5 py-2.5 font-semibold text-bucin-bg">
              Lanjut
            </button>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="mt-6 space-y-4">
            <p className="text-bucin-textSecondary">Klik tombol di bawah untuk membuka kejutan romantisnya.</p>
            <button type="button" onClick={nextStep} className="rounded-xl bg-bucin-gold px-5 py-2.5 font-semibold text-bucin-bg">
              Buka Kejutan
            </button>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="mt-6 space-y-5">
            <CakeVisual candleOff={candleOff} />
            <button type="button" onClick={nextStep} className="rounded-xl bg-bucin-gold px-5 py-2.5 font-semibold text-bucin-bg">
              Lanjut Make a Wish
            </button>
          </div>
        ) : null}

        {step === 4 ? (
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
              Simpan Wish
            </button>
          </div>
        ) : null}

        {step === 5 ? (
          <div className="mt-6 space-y-4">
            <CakeVisual candleOff={candleOff} />
            <button
              type="button"
              onClick={() => setCandleOff(true)}
              className="rounded-xl bg-bucin-gold px-5 py-2.5 font-semibold text-bucin-bg"
            >
              Tiup Lilin (klik)
            </button>
            {candleOff ? <p className="font-medium text-bucin-gold">Yay! Lilin padam, semoga wish kamu terkabul ✨</p> : null}
            {savedWish ? <p className="text-bucin-textSecondary">Wish terakhir: “{savedWish}”</p> : null}
          </div>
        ) : null}
      </motion.div>
    </section>
  );
}
