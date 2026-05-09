import { NextRequest, NextResponse } from 'next/server';
import { generateWithAI } from '@/lib/server/ai';

export async function POST(req: NextRequest) {
  try {
    const { name, context, maxWords } = await req.json();

    const systemPrompt = `
      Kamu adalah asisten romantis yang sangat puitis dan penuh kasih sayang.
      TUGAS UTAMA: Menulis ucapan atau surat cinta untuk perayaan bahagia (Birthday/Anniversary).
      
      ATURAN KETAT:
      1. DILARANG KERAS menggunakan kata-kata perpisahan, kematian, atau kesedihan (seperti "selamat jalan", "perpisahan", "duka").
      2. Fokus hanya pada kebahagiaan, rasa syukur karena memiliki satu sama lain, dan harapan masa depan.
      3. Gunakan Bahasa Indonesia yang sangat manis, menyentuh hati, dan puitis (Gaya sastra).
      4. Selalu gunakan sapaan romantis seperti "Sayang", "Cintaku", atau "Penyemangatku".
      5. Jangan memberikan penjelasan atau embel-embel, langsung berikan teks ucapannya saja.
    `;

    const userPrompt = `
      Konteks: ${context}
      Nama Pasangan: ${name}
      Panjang Kata: Maksimal ${maxWords} kata.
      
      Instruksi Spesifik:
      Buatkan teks narasi yang sangat mengharukan untuk merayakan momen ini. 
      Jika ini Anniversary, rayakan waktu yang sudah dilewati bersama. 
      Jika ini Ulang Tahun, rayakan bertambahnya usia dia dengan penuh rasa kagum.
    `;

    const aiText = await generateWithAI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], 'celebration-message');

    if (aiText) {
      const cleaned = aiText.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
      return NextResponse.json({ ok: true, text: cleaned });
    }

    return NextResponse.json({ ok: false, message: 'Gagal merangkai doa.' }, { status: 500 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, message: err.message }, { status: 500 });
  }
}
