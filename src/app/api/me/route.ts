import { NextRequest, NextResponse } from 'next/server';
import { getSessionRole } from '@/lib/auth';
import { getLiveSettings } from '@/lib/relationship';

export async function GET(req: NextRequest): Promise<NextResponse> {
  // Ambil role langsung dari cookie request untuk memastikan akurasi
  const role = await getSessionRole();
  const settings = await getLiveSettings();

  return NextResponse.json({ 
    ok: true, 
    role, 
    settings 
  }, {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    }
  });
}
