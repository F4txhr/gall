import { NextRequest, NextResponse } from 'next/server';
import { getPasswordForRole, isValidRole, SESSION_COOKIE } from '@/lib/auth';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = (await req.json()) as { role?: string; password?: string };

    if (!body.role || !isValidRole(body.role) || !body.password) {
      return NextResponse.json({ ok: false, message: 'Role/password tidak valid.' }, { status: 400 });
    }

    const expectedPassword = await getPasswordForRole(body.role);
    if (body.password !== expectedPassword) {
      return NextResponse.json({ ok: false, message: 'Password salah.' }, { status: 401 });
    }

    const res = NextResponse.json({ ok: true, role: body.role });
    
    // Deteksi HTTPS untuk Tunnel/Prod
    const isHttps = req.headers.get('x-forwarded-proto') === 'https' || req.url.startsWith('https');

    res.cookies.set(SESSION_COOKIE, body.role, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isHttps, // Sangat Penting: Harus true jika pakai HTTPS/Tunnel
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (err: any) {
    console.error('Login Error:', err.message);
    return NextResponse.json({ ok: false, message: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}
