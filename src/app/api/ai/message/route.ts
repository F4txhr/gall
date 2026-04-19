import { NextRequest, NextResponse } from 'next/server';
import { generateWithAI } from '@/lib/server/ai';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = (await req.json()) as { name?: string; context?: string };
  const name = body.name ?? 'Sayangku';
  const nonce = Date.now();

  const aiText = await generateWithAI(
    [
      {
        role: 'system',
        content:
          'Kamu penulis ucapan romantis berbahasa Indonesia. Tulis 1 paragraf pendek (maks 35 kata), hangat, tidak lebay, dan harus unik di setiap request.',
      },
      {
        role: 'user',
        content: `Buatkan ucapan ulang tahun romantis untuk ${name}. Konteks: ${body.context ?? 'Hubungan pasangan yang saling support.'}. Seed unik: ${nonce}`,
      },
    ],
    'message'
  );

  if (aiText) {
    return NextResponse.json({ ok: true, text: aiText, source: 'ai' });
  }

  return NextResponse.json({ ok: false, message: 'AI message generation failed. Check server logs and AI env.' }, { status: 503 });
}
