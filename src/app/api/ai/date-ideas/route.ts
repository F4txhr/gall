import { NextRequest, NextResponse } from 'next/server';
import { generateWithAI } from '@/lib/server/ai';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = (await req.json()) as { mood?: string; budget?: string; location?: string };
  const mood = body.mood || 'romantis';
  const budget = body.budget || 'fleksibel';
  const location = body.location || 'sekitar kota';
  
  const nonce = Date.now();

  const aiResponse = await generateWithAI(
    [
      {
        role: 'system',
        content: `Kamu adalah asisten kencan romantis. Berikan 3 ide kencan kreatif dan spesifik berdasarkan mood, budget, dan lokasi. 
        Format output harus JSON string yang bisa di-parse:
        {
          "ideas": [
            {"title": "Judul Ide", "description": "Penjelasan singkat", "icon": "emoji"},
            ...
          ],
          "closing": "Kata penutup romantis"
        }
        Gunakan bahasa Indonesia yang santai tapi manis.`,
      },
      {
        role: 'user',
        content: `Mood kami lagi ${mood}, budget ${budget}, lokasi ${location}. Berikan ide kencan seru! Seed: ${nonce}`,
      },
    ],
    'date-ideas'
  );

  if (aiResponse) {
    try {
      // Membersihkan kemungkinan tag <think> atau markdown
      const cleaned = aiResponse.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/```json|```/g, '').trim();
      const data = JSON.parse(cleaned);
      return NextResponse.json({ ok: true, ...data });
    } catch (e) {
      console.error('Failed to parse AI response:', aiResponse);
      return NextResponse.json({ ok: false, message: 'Gagal merangkai ide. Coba klik lagi!' }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: false, message: 'AI sedang sibuk memikirkan kencan lain.' }, { status: 503 });
}
