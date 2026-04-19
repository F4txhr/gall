import { NextRequest, NextResponse } from 'next/server';
import { generateWithAI } from '@/lib/server/ai';

function sanitizeMessage(raw: string): string {
  const noThink = raw.replace(/<think>[\s\S]*?<\/think>/gi, ' ').replace(/```[\s\S]*?```/g, ' ');
  const cleaned = noThink
    .replace(/^["'“”]+|["'“”]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const firstParagraph = cleaned.split('\n')[0]?.trim() ?? cleaned;
  const words = firstParagraph.split(' ').filter(Boolean).slice(0, 35);

  return words.join(' ').trim();
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = (await req.json()) as { name?: string; context?: string };
  const name = body.name ?? 'Sayangku';
  const nonce = Date.now();

  const aiText = await generateWithAI(
    [
      {
        role: 'system',
        content:
          'Kamu penulis ucapan romantis berbahasa Indonesia. HANYA output ucapan final, tanpa penjelasan, tanpa langkah berpikir, tanpa tag <think>. Maks 35 kata.',
      },
      {
        role: 'user',
        content: `Buatkan ucapan ulang tahun romantis untuk ${name}. Konteks: ${body.context ?? 'Hubungan pasangan yang saling support.'}. Seed unik: ${nonce}`,
      },
    ],
    'message'
  );

  if (aiText) {
    const text = sanitizeMessage(aiText);
    if (text) {
      return NextResponse.json({ ok: true, text, source: 'ai' });
    }
  }

  return NextResponse.json({ ok: false, message: 'AI message generation failed. Check server logs and AI env.' }, { status: 503 });
}
