import { NextRequest, NextResponse } from 'next/server';
import { generateWithAI } from '@/lib/server/ai';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = (await req.json()) as { partnerA?: string; partnerB?: string };
  const partnerA = body.partnerA ?? 'Aku';
  const partnerB = body.partnerB ?? 'Kamu';
  const nonce = Date.now();

  const aiQuote = await generateWithAI(
    [
      {
        role: 'system',
        content:
          'Kamu generator romantic quote bahasa Indonesia. Output 1 kalimat pendek (maks 16 kata), puitis ringan, dan harus berbeda di setiap request.',
      },
      {
        role: 'user',
        content: `Buat quote untuk pasangan ${partnerA} dan ${partnerB}. Seed unik: ${nonce}`,
      },
    ],
    'quote'
  );

  if (aiQuote) {
    return NextResponse.json({ ok: true, quote: aiQuote, source: 'ai' });
  }

  return NextResponse.json({ ok: false, message: 'AI quote generation failed. Check server logs and AI env.' }, { status: 503 });
}
