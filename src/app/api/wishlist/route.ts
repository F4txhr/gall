import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateWithAI } from '@/lib/server/ai';
import { getLiveSettings } from '@/lib/relationship';

export async function GET() {
  if (!supabase) return NextResponse.json({ error: 'No DB' }, { status: 500 });
  const { data } = await supabase.from('wishlist').select('*').order('created_at', { ascending: false });
  return NextResponse.json({ items: data || [] });
}

export async function POST(req: NextRequest) {
  if (!supabase) return NextResponse.json({ error: 'No DB' }, { status: 500 });

  try {
    const body = await req.json();
    const { title, addedBy } = body;
    const settings = await getLiveSettings();

    // AI Enrichment: Mencari detail tempat dan menghitung estimasi jarak
    const aiPrompt = `
      Kamu adalah asisten navigasi romantis. User ingin ke tempat: "${title}".
      Lokasi ${settings.partnerA} saat ini: ${settings.partnerALocation || 'Tidak diketahui'}.
      Lokasi ${settings.partnerB} saat ini: ${settings.partnerBLocation || 'Tidak diketahui'}.

      Berikan informasi detail tempat tersebut dalam format JSON:
      {
        "rating": number (1-5),
        "address": "alamat lengkap dan detail",
        "accurate_name": "nama tempat yang sangat spesifik untuk pencarian maps",
        "dist_a": "estimasi jarak dari ${settings.partnerA} (misal: 15 km)",
        "dist_b": "estimasi jarak dari ${settings.partnerB} (misal: 120 km)"
      }
      HANYA OUTPUT JSON.
    `;

    const aiRes = await generateWithAI([{ role: 'user', content: aiPrompt }], 'wishlist-enrich');
    let enriched = { 
      rating: 4.5, 
      address: title, 
      accurate_name: title,
      dist_a: '?', 
      dist_b: '?' 
    };

    if (aiRes) {
      try {
        let cleaned = aiRes.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/```json|```/g, '').trim();
        if (cleaned.startsWith('{') && !cleaned.endsWith('}')) cleaned += '"}';
        const parsed = JSON.parse(cleaned);
        enriched = { ...enriched, ...parsed };
      } catch (e) { 
        console.error('AI Parse failed', e); 
      }
    }

    // Buat Maps URL yang lebih akurat
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(enriched.accurate_name + ' ' + enriched.address)}`;

    console.log(`[Supabase] Menambah wishlist: ${title}`);
    const { data, error } = await supabase.from('wishlist').insert([{
      title,
      added_by: addedBy,
      rating: enriched.rating,
      address: enriched.address,
      maps_url: mapsUrl,
      dist_a: enriched.dist_a,
      dist_b: enriched.dist_b,
      status: 'pending'
    }]).select();

    if (error) {
      console.error(`[Supabase Error] ${error.code}: ${error.message}`);
      return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 500 });
    }
    
    return NextResponse.json({ ok: true, item: data[0] });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await supabase?.from('wishlist').delete().eq('id', id);
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest) {
  if (!supabase) return NextResponse.json({ error: 'No DB' }, { status: 500 });

  try {
    const { id, role, liked } = await req.json();
    const column = role === 'cowo' ? 'liked_by_cowo' : 'liked_by_cewe';

    const { error } = await supabase
      .from('wishlist')
      .update({ [column]: liked })
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
