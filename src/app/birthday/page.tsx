import { BirthdayFullscreen } from '@/components/overlays/BirthdayFullscreen';
import { Suspense } from 'react';

export default function BirthdayPreviewPage() {
  return (
    <main className="min-h-screen bg-bucin-bg">
      <Suspense fallback={null}>
        <BirthdayFullscreen force />
      </Suspense>
    </main>
  );
}
