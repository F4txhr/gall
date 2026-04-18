import { NextRequest, NextResponse } from 'next/server';
import { getPasswordForRole, isValidRole, SESSION_COOKIE } from '@/lib/auth';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = (await req.json()) as { role?: string; password?: string };

  if (!body.role || !isValidRole(body.role) || !body.password) {
    return NextResponse.json({ ok: false, message: 'Role/password tidak valid.' }, { status: 400 });
  }

  const expectedPassword = getPasswordForRole(body.role);
  if (body.password !== expectedPassword) {
    return NextResponse.json({ ok: false, message: 'Password salah.' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true, role: body.role });
  res.cookies.set(SESSION_COOKIE, body.role, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  return res;
}
