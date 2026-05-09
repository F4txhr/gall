import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { s3Client, BUCKET_NAME } from '@/lib/server/r2';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { sendTelegramNotification } from '@/lib/server/telegram';

export async function GET() {
  if (!supabase) return NextResponse.json({ error: 'Supabase client not initialized' }, { status: 500 });
  try {
    const { data, error } = await supabase
      .from('memories')
      .select('id, url, caption, location, taken_at, batch_id, created_at')
      .order('taken_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ memories: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!supabase) return NextResponse.json({ error: 'Supabase not initialized' }, { status: 500 });
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const caption = formData.get('caption') as string || 'Kenangan ✨';
    const location = formData.get('location') as string || '';
    const takenAt = formData.get('taken_at') as string || new Date().toISOString();
    const wishlistId = formData.get('wishlist_id') as string || null;
    const batchId = `batch_${Date.now()}`; 

    if (!files.length) return NextResponse.json({ error: 'No files' }, { status: 400 });

    const results = [];
    const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;

    for (const file of files) {
      try {
        const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
        const arrayBuffer = await file.arrayBuffer();
        
        const command = new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: filename,
          Body: Buffer.from(arrayBuffer),
          ContentType: file.type,
          CacheControl: 'public, max-age=31536000, immutable',
        });

        await s3Client.send(command);
        const publicUrl = `${R2_PUBLIC_URL}/${filename}`;
        
        const { data, error: dbError } = await supabase
          .from('memories')
          .insert([{ url: publicUrl, caption, location, taken_at: takenAt, batch_id: batchId }])
          .select();

        if (dbError) throw new Error(`Gagal simpan ke database: ${dbError.message}`);
        
        try {
          const botToken = process.env.TELEGRAM_BOT_TOKEN;
          const chatIds = [process.env.TELEGRAM_CHAT_ID_COWO, process.env.TELEGRAM_CHAT_ID_CEWE];
          for (const cid of chatIds) {
            if (!cid) continue;
            const formDataTele = new FormData();
            formDataTele.append('photo', new Blob([arrayBuffer]), file.name);
            formDataTele.append('caption', `📸 *Kenangan Baru!*\n\n📍 ${location || '-'}\n📅 ${new Date(takenAt).toLocaleDateString('id-ID')}\n\n"${caption}"`);
            formDataTele.append('parse_mode', 'Markdown');

            await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto?chat_id=${cid}`, {
              method: 'POST', body: formDataTele, signal: AbortSignal.timeout(30000),
            }).catch(e => console.error(`[Telegram] Gagal:`, e.message));
          }
        } catch (teleErr) {}

        try {
          const { uploadToDrive } = await import('@/lib/server/drive');
          const formattedDate = new Date(takenAt).toISOString().split('T')[0];
          const folderName = `[${formattedDate}] ${caption}`;
          await uploadToDrive(arrayBuffer, file.name, file.type, folderName);
        } catch (driveErr) {}
        
        results.push(data[0]);
      } catch (uploadErr: any) {
        return NextResponse.json({ error: uploadErr.message }, { status: 500 });
      }
    }

    if (wishlistId && supabase) await supabase.from('wishlist').update({ status: 'visited' }).eq('id', wishlistId);
    await sendTelegramNotification('both', `📸 *Album Baru: ${caption}* 📸\n\n🖼️ Jumlah: ${files.length} Foto\n📍 Lokasi: ${location || '-'}\n📅 Tanggal: ${new Date(takenAt).toLocaleDateString('id-ID')}\n\nLihat di web kita! ✨`);

    return NextResponse.json({ success: true, results });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!supabase) return NextResponse.json({ error: 'Supabase not initialized' }, { status: 500 });
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const { data: memory } = await supabase.from('memories').select('url').eq('id', id).single();
    if (memory?.url) {
      const filename = memory.url.split('/').pop();
      if (filename) {
        const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');
        await s3Client.send(new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: filename }));
      }
    }

    const { error: dbError } = await supabase.from('memories').delete().eq('id', id);
    if (dbError) throw dbError;

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!supabase) return NextResponse.json({ error: 'Supabase not initialized' }, { status: 500 });
  try {
    // Terima id (individual) ATAU batchId (kelompok)
    const { id, batchId, caption, location, takenAt } = await request.json();
    
    if (!id && !batchId) return NextResponse.json({ error: 'ID or Batch ID required' }, { status: 400 });

    const updateData = { 
        caption, 
        location, 
        taken_at: takenAt,
        updated_at: new Date().toISOString() 
    };

    let query = supabase.from('memories').update(updateData);
    
    if (batchId) {
        query = query.eq('batch_id', batchId);
    } else if (id) {
        query = query.eq('id', id);
    }

    const { error } = await query;
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
