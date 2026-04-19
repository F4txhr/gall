import { NextRequest, NextResponse } from 'next/server';
import { generateWithAI } from '@/lib/server/ai';

function sanitizeQuote(raw: string): string {
  const noThink = raw.replace(/<think>[\s\S]*?<\/think>/gi, ' ').replace(/```[\s\S]*?```/g, ' ');
  const cleaned = noThink
    .replace(/^["'“”]+|["'“”]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const firstSentence = cleaned.split(/[.!?\n]/)[0]?.trim() ?? cleaned;
  const words = firstSentence.split(' ').filter(Boolean).slice(0, 16);

  return words.join(' ').replace(/[,:;\-]+$/g, '').trim();
}

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
          'Kamu generator romantic quote bahasa Indonesia. HANYA output quote final, tanpa penjelasan, tanpa langkah berpikir, tanpa tag <think>. Maksimal 16 kata.',
      },
      {
        role: 'user',
        content: `Buat quote untuk pasangan ${partnerA} dan ${partnerB}. Seed unik: ${nonce}`,
      },
    ],
    'quote'
  );

  if (aiQuote) {
    const quote = sanitizeQuote(aiQuote);
    if (quote) {
      return NextResponse.json({ ok: true, quote, source: 'ai' });
    }
  }

  return NextResponse.json({ ok: false, message: 'AI quote generation failed. Check server logs and AI env.' }, { status: 503 });
}
