import { Navbar } from '@/components/layout/Navbar';
import { BirthdayFullscreen } from '@/components/overlays/BirthdayFullscreen';
import { CelebrationFlow } from '@/components/sections/CelebrationFlow';
import { CountdownTabs } from '@/components/sections/CountdownTabs';
import { HeroTyping } from '@/components/sections/HeroTyping';
import { LoveCounter } from '@/components/sections/LoveCounter';

export default function Home(): JSX.Element {
  return (
    <>
      <BirthdayFullscreen />
      <Navbar />
      <main className="bg-bucin-bg text-bucin-text">
        <HeroTyping />
        <LoveCounter />
        <section id="countdown">
          <CountdownTabs />
        </section>
        <section id="celebration">
          <CelebrationFlow />
        </section>
      </main>
    </>
  );
}
