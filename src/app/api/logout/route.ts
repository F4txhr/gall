import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  
  // Hapus cookie sesi
  cookieStore.delete('user_role');
  
  // Arahkan kembali ke halaman login
  return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'));
}

// Tetap sediakan POST sebagai cadangan
export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete('user_role');
  return NextResponse.json({ ok: true });
}
