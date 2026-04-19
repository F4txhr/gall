import { BirthdayFullscreen } from '@/components/overlays/BirthdayFullscreen';
import { CelebrationFlow } from '@/components/sections/CelebrationFlow';
import { CountdownTabs } from '@/components/sections/CountdownTabs';
import { HeroTyping } from '@/components/sections/HeroTyping';
import { LoveCounter } from '@/components/sections/LoveCounter';

export default function Home(): JSX.Element {
  return (
    <div className="space-y-12 pb-20">
      {/* Celebration Mode (Hidden by default, Takeover on Birthday/Anniv) */}
      <CelebrationFlow />
      
      <BirthdayFullscreen />
      
      {/* Hero Section */}
      <section className="relative">
        <HeroTyping />
      </section>

      {/* Love Counter Section - Fitted Card */}
      <section className="flex justify-center px-6">
        <div className="card-bucin p-6 md:p-10 text-center w-full max-w-2xl">
          <p className="glow-pink mb-6 text-[10px] font-bold uppercase tracking-[0.5em] text-bucin-pink">
            Detik-detik Bersamamu ✨
          </p>
          <LoveCounter />
        </div>
      </section>

      {/* Countdown Section - Fitted Card */}
      <section id="countdown" className="flex justify-center px-6">
        <div className="card-bucin p-8 md:p-12 w-full max-w-3xl">
           <h2 className="glow-gold mb-10 text-center text-2xl font-bold text-bucin-gold tracking-tight">
             Momen Spesial Selanjutnya 💖
           </h2>
           <CountdownTabs />
        </div>
      </section>
    </div>
  );
}
