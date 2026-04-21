import { NextRequest, NextResponse } from 'next/server';
import { generateWithAI } from '@/lib/server/ai';

export async function POST(): Promise<NextResponse> {
  try {
    const nonce = Date.now();
    const aiText = await generateWithAI(
      [
        {
          role: 'system',
          content:
            'Kamu adalah pujangga cinta. Buat 1 kalimat kutipan romantis pendek (max 15 kata) dalam Bahasa Indonesia. Tanpa penjelasan, tanpa tanda kutip, tanpa tag think.',
        },
        {
          role: 'user',
          content: `Buatkan quote romantis baru yang puitis. Seed: ${nonce}`,
        },
      ],
      'quote'
    );

    if (aiText) {
      // Pembersihan extra untuk mencegah SyntaxError
      const text = aiText
        .replace(/<think>[\s\S]*?<\/think>/gi, '')
        .replace(/["'“”]+/g, '')
        .trim();
      
      if (text) {
        return NextResponse.json({ ok: true, text });
      }
    }

    return NextResponse.json({ ok: false, message: 'Gagal menenun kata.' }, { status: 500 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, message: err.message }, { status: 500 });
  }
}
