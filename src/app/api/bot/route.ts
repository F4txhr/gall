import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ALLOWED_IDS = [
  process.env.TELEGRAM_CHAT_ID_COWO,
  process.env.TELEGRAM_CHAT_ID_CEWE
].filter(Boolean);

async function updateSetting(key: string, value: string) {
  if (!supabase) {
    console.error('[BOT] Supabase client is not initialized.');
    return false;
  }
  const { error } = await supabase.from('settings').upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  return !error;
}

export async function POST(request: NextRequest) {
  if (!BOT_TOKEN) return NextResponse.json({ error: 'No token' }, { status: 500 });

  try {
    const payload = await request.json();
    const message = payload.message;
    if (!message || !message.text) return NextResponse.json({ ok: true });

    const chatId = message.chat.id.toString();
    const text = message.text as string;
    const [command, ...argsArr] = text.split(' ');
    const args = argsArr.join(' ').trim();

    const isAuthorized = ALLOWED_IDS.includes(chatId);
    let reply = '';

    if (!isAuthorized) {
      reply = `👋 *Halo! Sepertinya kamu ingin punya Web Bucin sendiri?*\n\nMaaf, bot ini hanya melayani pemilik sah. Tapi jangan sedih, kamu bisa buat sendiri kok! Ini caranya:\n\n1️⃣ *Clone Repo:* Ambil script web ini di GitHub.\n2️⃣ *Deploy ke Vercel:* Gratis dan cepat!\n3️⃣ *Setup Database:* Gunakan Supabase.\n4️⃣ *Setup Bot:* Buat bot di @BotFather.\n5️⃣ *Env Config:* Masukkan URL database dan Token Bot ke Vercel.\n\n🚀 *Gampang kan? Yuk buat ruang cintamu sendiri!*`;
    } else {
      if (!supabase) {
        reply = '❌ Sistem sedang sibuk. Database tidak terdeteksi.';
      } else {
        switch (command.toLowerCase()) {
          case '/start':
            reply = `🤖 *Remote Web Bucin Pro*\n\n/setname_a [nama] - Nama Cowo\n/setname_b [nama] - Nama Cewe\n/setstart [YYYY-MM-DD] - Tgl Jadian\n/setultah_a [YYYY-MM-DD] - Ultah Cowo\n/setultah_b [YYYY-MM-DD] - Ultah Cewe\n/setpw_a [pw] - PW Cowo\n/setpw_b [pw] - PW Cewe\n/setquote [teks] - Quote Hero\n/stalk - Cek kunjungan si cewe\n/status - Kondisi Web`;
            break;
          
          case '/setquote': reply = (await updateSetting('romantic_quote', args)) ? '✅ Quote updated!' : '❌ Failed.'; break;
          case '/setname_a': reply = (await updateSetting('partner_a_name', args)) ? '✅ Name A updated!' : '❌ Failed.'; break;
          case '/setname_b': reply = (await updateSetting('partner_b_name', args)) ? '✅ Name B updated!' : '❌ Failed.'; break;
          case '/setstart': reply = (await updateSetting('relationship_start', args)) ? '✅ Date updated!' : '❌ Failed.'; break;
          case '/setultah_a': reply = (await updateSetting('birthday_cowo_date', args)) ? '✅ Birthday A updated!' : '❌ Failed.'; break;
          case '/setultah_b': reply = (await updateSetting('birthday_cewe_date', args)) ? '✅ Birthday B updated!' : '❌ Failed.'; break;
          case '/setpw_a': reply = (await updateSetting('cowo_password', args)) ? '✅ PW A updated!' : '❌ Failed.'; break;
          case '/setpw_b': reply = (await updateSetting('cewe_password', args)) ? '✅ PW B updated!' : '❌ Failed.'; break;
          
          case '/status':
            const { data } = await supabase.from('settings').select('key, value');
            let st = '📊 *Status Web:*\n\n';
            data?.forEach(i => {
              if (i.key.includes('password') || i.key.includes('visit')) return;
              st += `• ${i.key}: \`${i.value}\`\n`;
            });
            reply = st + '\n✅ Semua aman bos!';
            break;

          case '/stalk':
            const cnt = await supabase.from('settings').select('value').eq('key', 'cewe_visit_count').single();
            const lst = await supabase.from('settings').select('value').eq('key', 'cewe_last_visit').single();
            reply = `🕵️ *Laporan Intelijen Bucin:*\n\n💖 Pasanganmu sudah berkunjung selama: *${cnt.data?.value || 0} hari*.\n📅 Terakhir: \`${lst.data?.value || '-'}\``;
            break;

          case '/id': reply = `ID Chat kamu: \`${chatId}\``; break;
          default: reply = '❓ Command tidak dikenal.';
        }
      }
    }

    if (reply) {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: reply, parse_mode: 'Markdown' }),
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
