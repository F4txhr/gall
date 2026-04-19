import { NextRequest, NextResponse } from 'next/server';

interface Env {
  BUCKET: R2Bucket;
}

export const runtime = 'edge';

// Menampilkan gambar dari R2 Bucket
export async function GET(request: NextRequest) {
  const env = (request as any).env as Env;
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');

  if (!env?.BUCKET) {
    return NextResponse.json({ error: 'R2 Bucket not found' }, { status: 500 });
  }

  if (!key) {
    return NextResponse.json({ error: 'Key not found' }, { status: 400 });
  }

  try {
    const object = await env.BUCKET.get(key);

    if (!object) {
      return NextResponse.json({ error: 'Object not found' }, { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('Cache-Control', 'public, max-age=31536000'); // Cache 1 tahun

    return new NextResponse(object.body as ReadableStream, {
      headers,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
