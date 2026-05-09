import { NextRequest, NextResponse } from 'next/server';
import { relationshipConfig } from '@/lib/relationship';

export async function POST(req: NextRequest) {
  try {
    const { action, senderRole } = await req.json();
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatIds = {
      cowo: process.env.TELEGRAM_CHAT_ID_COWO,
      cewe: process.env.TELEGRAM_CHAT_ID_CEWE,
    };

    const senderName = senderRole === 'cowo' ? relationshipConfig.partnerA : relationshipConfig.partnerB;
    const targetId = senderRole === 'cowo' ? chatIds.cewe : chatIds.cowo;

    if (!botToken || !targetId) return NextResponse.json({ ok: false });

    let message = '';
    if (action === 'celebration_started') {
      message = `✨ *Momen Spesial Dimulai!* ✨\n\n${senderName} baru saja mulai membuka kado di website kalian! ❤️\n\nYuk, buka web sekarang buat nemenin dan lihat kejutan bareng-bareng! 🚀`;
    } else if (action === 'wish_submitted') {
      message = `💖 *Doa Baru Terkirim!* 💖\n\n${senderName} baru saja mengirimkan doanya. Cek website buat lihat surat cinta dari AI yang merangkum doa kalian! ✨`;
    } else if (action === 'poke') {
      message = `❤️ *Sssttt... Ada yang Kangen!* ❤️\n\n*${senderName}* baru saja menekan tombol Kangen di website. Dia lagi mikirin kamu banget nih! ✨`;
    }

    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: targetId, text: message, parse_mode: 'Markdown' }),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
