import { NextRequest, NextResponse } from 'next/server';
import { generateWithAI } from '@/lib/server/ai';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = (await req.json()) as { partnerA?: string; partnerB?: string };
  const partnerA = body.partnerA ?? 'Aku';
  const partnerB = body.partnerB ?? 'Kamu';

  const aiQuote = await generateWithAI([
    {
      role: 'system',
      content:
        'Kamu generator romantic quote bahasa Indonesia. Output 1 kalimat pendek (maks 16 kata), puitis ringan, dan berbeda setiap request.',
    },
    {
      role: 'user',
      content: `Buat quote untuk pasangan ${partnerA} dan ${partnerB}.`,
    },
  ]);

  if (aiQuote) {
    return NextResponse.json({ ok: true, quote: aiQuote, source: 'ai' });
  }

  return NextResponse.json({ ok: true, quote: 'Cinta yang baik tumbuh dari hal kecil yang dijaga setiap hari.', source: 'fallback' });
}
