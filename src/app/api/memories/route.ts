import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { s3Client, BUCKET_NAME } from '@/lib/server/r2';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { sendTelegramNotification } from '@/lib/server/telegram';
import { generateWithAI } from '@/lib/server/ai';

export const runtime = 'edge';

// GET: Ambil daftar foto dari Supabase
export async function GET() {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase client not initialized' }, { status: 500 });
  }

  try {
    const { data, error } = await supabase
      .from('memories')
      .select('id, url, caption, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ memories: data || [] });
  } catch (err: any) {
    console.error('[SUPABASE:MEMORIES:GET] Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Upload foto ke R2 (via S3 SDK) dan simpan URL ke Supabase
export async function POST(request: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not initialized' }, { status: 500 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    let caption = formData.get('caption') as string || '';

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // AI AUTO-CAPTION jika caption kosong atau default
    if (!caption || caption === 'Kenangan baru ✨') {
      const aiCaption = await generateWithAI([
        { role: 'system', content: 'Kamu adalah asisten romantis. Buat satu caption singkat (max 10 kata) untuk foto kenangan pasangan. Jangan pakai kutip.' },
        { role: 'user', content: `Buatkan caption untuk foto berjudul: ${file.name}` }
      ], 'autocaption');
      if (aiCaption) caption = aiCaption;
    }

    // Nama file unik
    const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    
    // Konversi File ke Buffer untuk SDK S3
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload ke R2 via S3 Client
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: filename,
      Body: buffer,
      ContentType: file.type,
    });

    await s3Client.send(command);

    // URL Publik R2
    const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
    const publicUrl = `${R2_PUBLIC_URL}/${filename}`;

    // Simpan metadata ke Supabase
    const { error: dbError } = await supabase
      .from('memories')
      .insert([{ url: publicUrl, caption }]);

    if (dbError) throw dbError;

    // NOTIFIKASI TELEGRAM
    await sendTelegramNotification('both', `📸 *Kenangan Baru Diunggah!* 📸\n\nCaption: "${caption}"\n\nLihat fotonya di web! ✨`);

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (err: any) {
    console.error('[R2:UPLOAD] Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
