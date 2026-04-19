import { CelebrationFlow } from '@/components/sections/CelebrationFlow';
import { CountdownTabs } from '@/components/sections/CountdownTabs';
import { HeroTyping } from '@/components/sections/HeroTyping';
import { LoveCounter } from '@/components/sections/LoveCounter';

export default function Home(): JSX.Element {
  return (
    <main className="bg-bucin-bg text-bucin-text">
      <HeroTyping />
      <LoveCounter />
      <CountdownTabs />
      <CelebrationFlow />
    </main>
  );
}
