import { BirthdayFullscreen } from '@/components/overlays/BirthdayFullscreen';

export default function BirthdayPreviewPage(): JSX.Element {
  return (
    <main className="min-h-screen bg-bucin-bg">
      <BirthdayFullscreen force />
    </main>
  );
}
