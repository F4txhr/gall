import { NextRequest, NextResponse } from 'next/server';
import { relationshipConfig } from '@/lib/relationship';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, senderRole } = body;
    
    if (!imageBase64) return NextResponse.json({ error: 'No image' }, { status: 400 });

    // Konversi base64 ke Buffer
    const buffer = Buffer.from(imageBase64.split(',')[1], 'base64');
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatIds = [process.env.TELEGRAM_CHAT_ID_COWO, process.env.TELEGRAM_CHAT_ID_CEWE];
    
    const senderName = senderRole === 'cowo' ? relationshipConfig.partnerA : relationshipConfig.partnerB;

    const formData = new FormData();
    const blob = new Blob([buffer], { type: 'image/png' });
    formData.append('photo', blob, 'bucin-booth.png');
    formData.append('caption', `📸 *Hasil Bucin Booth!* 📸\n\nKenangan manis baru saja diabadikan oleh *${senderName}*.\n\nSimpan foto ini baik-baik ya! ❤️`);
    formData.append('parse_mode', 'Markdown');

    for (const cid of chatIds) {
      if (cid) {
        await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto?chat_id=${cid}`, {
          method: 'POST',
          body: formData,
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
