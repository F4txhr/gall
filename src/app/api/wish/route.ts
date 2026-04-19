import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendTelegramNotification } from '@/lib/server/telegram';

// GET: Ambil daftar Wish dari Supabase
export async function GET() {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase client not initialized' }, { status: 500 });
  }

  try {
    const { data, error } = await supabase
      .from('wishes')
      .select('id, author_role, content, created_at')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    return NextResponse.json({ wishes: data || [] });
  } catch (err: any) {
    console.error('[SUPABASE:WISH:GET] Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Simpan Wish baru ke Supabase
export async function POST(request: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase client not initialized' }, { status: 500 });
  }

  try {
    const { author_role, content } = await request.json();

    if (!author_role || !content) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    const { error } = await supabase
      .from('wishes')
      .insert([{ author_role, content }]);

    if (error) throw error;

    // NOTIFIKASI TELEGRAM
    const target = author_role === 'cowo' ? 'cewe' : 'cowo';
    const sender = author_role === 'cowo' ? 'Pasangan Gantengmu' : 'Pasangan Cantikmu';
    
    await sendTelegramNotification(target, `✨ *Ada Wish Baru!* ✨\n\nDari: ${sender}\nIsi: "${content}"\n\nCek sekarang di web! 💖`);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[SUPABASE:WISH:POST] Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
