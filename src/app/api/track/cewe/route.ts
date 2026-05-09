import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  if (!supabase) return NextResponse.json({ ok: false });

  try {
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

    // 1. Ambil data kunjungan terakhir dan total hari
    const { data: settings } = await supabase
      .from('settings')
      .select('key, value')
      .in('key', ['cewe_last_visit', 'cewe_visit_count']);

    const lastVisit = settings?.find(s => s.key === 'cewe_last_visit')?.value;
    const currentCount = parseInt(settings?.find(s => s.key === 'cewe_visit_count')?.value || '0');

    // 2. Jika hari ini belum tercatat, update database
    if (lastVisit !== today) {
      const newCount = currentCount + 1;
      
      await supabase.from('settings').upsert([
        { key: 'cewe_last_visit', value: today, updated_at: new Date().toISOString() },
        { key: 'cewe_visit_count', value: newCount.toString(), updated_at: new Date().toISOString() }
      ], { onConflict: 'key' });

      console.log(`[Tracker] Cewe berkunjung hari ke-${newCount}`);
      return NextResponse.json({ ok: true, count: newCount, newVisit: true });
    }

    return NextResponse.json({ ok: true, count: currentCount, newVisit: false });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
