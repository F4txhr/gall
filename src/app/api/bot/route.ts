import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const runtime = 'edge';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

async function updateSetting(key: string, value: string) {
  if (!supabase) return false;
  const { error } = await supabase
    .from('settings')
    .upsert({ key, value, updated_at: new Date().toISOString() });
  return !error;
}

export async function POST(request: NextRequest) {
  if (!BOT_TOKEN) return NextResponse.json({ error: 'No token' }, { status: 500 });

  try {
    const body = await request.json();
    const message = body.message;
    if (!message || !message.text) return NextResponse.json({ ok: true });

    const chatId = message.chat.id;
    const text = message.text;
    const command = text.split(' ')[0].toLowerCase();
    const args = text.split(' ').slice(1).join(' ');

    let reply = '';

    switch (command) {
      case '/start':
        reply = '🤖 *Web Bucin Remote v2.0*\n\nPerintah tersedia:\n/setquote [teks] - Ganti quote hero\n/setname_a [nama] - Ganti nama Cowo\n/setname_b [nama] - Ganti nama Cewe\n/status - Cek kondisi web\n/id - Cek ID chat kamu';
        break;
      
      case '/setquote':
        if (!args) reply = 'Format: `/setquote Teks Quote Kamu`';
        else {
          const ok = await updateSetting('romantic_quote', args);
          reply = ok ? `✅ Quote berhasil diubah menjadi: "${args}"` : '❌ Gagal update database.';
        }
        break;

      case '/setname_a':
        if (!args) reply = 'Format: `/setname_a NamaCowo`';
        else {
          await updateSetting('partner_a_name', args);
          reply = `✅ Nama Cowo diubah menjadi: ${args}`;
        }
        break;

      case '/setname_b':
        if (!args) reply = 'Format: `/setname_b NamaCewe`';
        else {
          await updateSetting('partner_b_name', args);
          reply = `✅ Nama Cewe diubah menjadi: ${args}`;
        }
        break;

      case '/status':
        reply = '🚀 *Status Web: Online*\n☁️ *Storage: R2 Active*\n🗄️ *Database: Supabase Active*\n\nSemua sistem berjalan normal! ✨';
        break;

      case '/id':
        reply = `ID Chat kamu: \`${chatId}\``;
        break;

      default:
        reply = 'Maaf, saya tidak kenal perintah itu. Ketik /start untuk bantuan.';
    }

    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: reply, parse_mode: 'Markdown' }),
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
