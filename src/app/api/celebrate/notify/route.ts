import { NextRequest, NextResponse } from 'next/server';
import { sendTelegramNotification } from '@/lib/server/telegram';
import { relationshipConfig, getCelebrationStatus } from '@/lib/relationship';

export async function POST(request: NextRequest) {
  const { action, senderRole } = await request.json();

  const status = getCelebrationStatus(relationshipConfig);
  if (!status) return NextResponse.json({ ok: false });

  if (action === 'midnight') {
    const message = status.type === 'anniversary' 
      ? `💖 *HAPPY ANNIVERSARY!* 💖\n\nSelamat hari jadi yang ke-${status.years} untuk kita berdua. Mari buka lembaran baru penuh cinta hari ini.\n\nBuka web kita sekarang: [Web Bucin](${process.env.NEXT_PUBLIC_BASE_URL})`
      : `🎂 *HAPPY BIRTHDAY!* 🎂\n\nSelamat ulang tahun yang ke-${status.years}, sayangku ${status.name}. Semoga setiap doamu terkabul hari ini.\n\n- Dari orang yang menyayangimu ❤️`;
    
    await sendTelegramNotification(status.type === 'anniversary' ? 'both' : (senderRole === 'cowo' ? 'cewe' : 'cowo'), message);
  }

  if (action === 'call_partner') {
    const partnerRole = senderRole === 'cowo' ? 'cewe' : 'cowo';
    const senderName = senderRole === 'cowo' ? relationshipConfig.partnerA : relationshipConfig.partnerB;
    
    await sendTelegramNotification(partnerRole, `💌 *Panggilan Sayang!* 💌\n\n${senderName} sedang menunggumu di web untuk merayakan momen spesial ini bersama. Yuk online sekarang! ✨`);
  }

  return NextResponse.json({ ok: true });
}
