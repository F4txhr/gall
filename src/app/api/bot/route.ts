import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// export const runtime = 'edge';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

async function updateSetting(key: string, value: string) {
  if (!supabase) {
    console.error('[BOT] ❌ Supabase not initialized');
    return false;
  }
  
  console.log(`[BOT] Menyiapkan update: ${key} = ${value}`);
  
  const { error } = await supabase
    .from('settings')
    .upsert(
      { key, value, updated_at: new Date().toISOString() },
      { onConflict: 'key' }
    );

  if (error) {
    console.error(`[BOT] ❌ Gagal update ${key}:`, error.message);
    return false;
  }
  
  console.log(`[BOT] ✅ Berhasil update ${key} di database.`);
  return true;
}

export async function POST(request: NextRequest) {
  if (!BOT_TOKEN) return NextResponse.json({ error: 'No token' }, { status: 500 });

  try {
    const payload = await request.json();
    const message = payload.message;
    if (!message || !message.text) return NextResponse.json({ ok: true });

    const chatId = message.chat.id;
    const text = message.text as string;
    const [command, ...argsArr] = text.split(' ');
    const args = argsArr.join(' ').trim();

    let reply = '';

    switch (command.toLowerCase()) {
      case '/start':
        reply = '🤖 *Web Bucin Remote v3.1*\n\n*Pengaturan Profil:*\n/setname_a [nama] - Ganti nama Cowo\n/setname_b [nama] - Ganti nama Cewe\n/setloc_a [kota] - Lokasi Cowo\n/setloc_b [kota] - Lokasi Cewe\n\n*Pengaturan Keamanan:*\n/setpw_a [pw] - Password Cowo\n/setpw_b [pw] - Password Cewe\n\n*Pengaturan Tanggal (YYYY-MM-DD):*\n/setstart [tgl] - Tanggal Jadian\n/setultah_a [tgl] - Ultah Cowo\n/setultah_b [tgl] - Ultah Cewe\n\n*Lainnya:*\n/setquote [teks] - Ganti quote hero\n/status - Cek kondisi web';
        break;
      
      case '/setquote':
        if (!args) reply = 'Format: `/setquote Teks Quote Kamu`';
        else {
          const ok = await updateSetting('romantic_quote', args);
          reply = ok ? `✅ Quote hero diubah menjadi: ${args}` : '❌ Gagal update database.';
        }
        break;

      case '/setname_a':
        if (!args) reply = 'Format: `/setname_a NamaCowo`';
        else {
          const ok = await updateSetting('partner_a_name', args);
          reply = ok ? `✅ Nama Cowo diubah menjadi: ${args}` : '❌ Gagal update database.';
        }
        break;

      case '/setname_b':
        if (!args) reply = 'Format: `/setname_b NamaCewe`';
        else {
          const ok = await updateSetting('partner_b_name', args);
          reply = ok ? `✅ Nama Cewe diubah menjadi: ${args}` : '❌ Gagal update database.';
        }
        break;

      case '/setloc_a':
        if (!args) reply = 'Format: `/setloc_a NamaKota`';
        else {
          const ok = await updateSetting('partner_a_location', args);
          reply = ok ? `✅ Lokasi Cowo diatur ke: ${args}` : '❌ Gagal update database.';
        }
        break;

      case '/setloc_b':
        if (!args) reply = 'Format: `/setloc_b NamaKota`';
        else {
          const ok = await updateSetting('partner_b_location', args);
          reply = ok ? `✅ Lokasi Cewe diatur ke: ${args}` : '❌ Gagal update database.';
        }
        break;

      case '/setpw_a':
        if (!args) reply = 'Format: `/setpw_a PasswordBaru`';
        else {
          const ok = await updateSetting('cowo_password', args);
          reply = ok ? `✅ Password Cowo telah diubah.` : '❌ Gagal update database.';
        }
        break;

      case '/setpw_b':
        if (!args) reply = 'Format: `/setpw_b PasswordBaru`';
        else {
          const ok = await updateSetting('cewe_password', args);
          reply = ok ? `✅ Password Cewe telah diubah.` : '❌ Gagal update database.';
        }
        break;

      case '/setstart':
        if (!args) reply = 'Format: `/setstart YYYY-MM-DD`';
        else {
          const ok = await updateSetting('relationship_start', args);
          reply = ok ? `✅ Tanggal jadian diubah menjadi: ${args}.\nSistem otomatis menghitung countdown Anniversary berikutnya!` : '❌ Gagal update database.';
        }
        break;

      case '/setultah_a':
        if (!args) reply = 'Format: `/setultah_a YYYY-MM-DD`';
        else {
          const ok = await updateSetting('birthday_cowo_date', args);
          reply = ok ? `✅ Tanggal lahir Cowo diubah. Countdown otomatis ke ultah berikutnya!` : '❌ Gagal update database.';
        }
        break;

      case '/setultah_b':
        if (!args) reply = 'Format: `/setultah_b YYYY-MM-DD`';
        else {
          const ok = await updateSetting('birthday_cewe_date', args);
          reply = ok ? `✅ Tanggal lahir Cewe diubah. Countdown otomatis ke ultah berikutnya!` : '❌ Gagal update database.';
        }
        break;

      case '/status':
        if (!supabase) {
          reply = '❌ Supabase belum terhubung.';
        } else {
          const { data, error } = await supabase.from('settings').select('key, value');
          if (error) {
            reply = `❌ Gagal mengambil data: ${error.message}`;
          } else if (!data || data.length === 0) {
            reply = '📭 Database masih kosong. Gunakan perintah /set... untuk mengisi.';
          } else {
            let statusText = '📊 *Kondisi Web Saat Ini:*\n\n';
            data.forEach(item => {
              // Format key agar lebih cantik (misal: partner_a_name -> Partner A Name)
              const cleanKey = item.key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
              statusText += `• *${cleanKey}:* \`${item.value}\`\n`;
            });
            reply = statusText + '\n✨ Semua sistem berjalan normal!';
          }
        }
        break;

      case '/id':
        reply = `ID Chat kamu: \`${chatId}\``;
        break;

      default:
        reply = 'Perintah tidak dikenal. Ketik /start untuk bantuan.';
    }

    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: reply, parse_mode: 'Markdown' }),
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[BOT Error]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
