import { NextResponse } from 'next/server';
import { getSessionRole } from '@/lib/auth';

export async function GET(): Promise<NextResponse> {
  const role = await getSessionRole();
  return NextResponse.json({ ok: true, role });
}
