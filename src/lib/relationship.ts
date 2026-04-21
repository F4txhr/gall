import { supabase } from './supabase';

export type DynamicSettings = {
  partnerA: string;
  partnerB: string;
  partnerALocation: string;
  partnerBLocation: string;
  galleryLayout: 'scrapbook' | 'museum' | 'deck';
  musicUrl: string;
  quote: string;
  relationshipStart: string;
  anniversaryDate: string; // Akan dihitung otomatis
  birthdayCowoDate: string; // Akan dihitung otomatis
  birthdayCeweDate: string; // Akan dihitung otomatis
};

const defaultSettings: DynamicSettings = {
  partnerA: process.env.NEXT_PUBLIC_PARTNER_A_NAME ?? 'Kamu',
  partnerB: process.env.NEXT_PUBLIC_PARTNER_B_NAME ?? 'Dia',
  partnerALocation: '',
  partnerBLocation: '',
  galleryLayout: 'scrapbook',
  musicUrl: '',
  quote: process.env.NEXT_PUBLIC_ROMANTIC_QUOTE ?? 'Setiap detik bersamamu adalah rumah.',
  relationshipStart: process.env.NEXT_PUBLIC_RELATIONSHIP_START ?? '2024-01-01T00:00:00+07:00',
  anniversaryDate: '',
  birthdayCowoDate: '2000-12-01T00:00:00+07:00',
  birthdayCeweDate: '2000-08-20T00:00:00+07:00',
};

export const relationshipConfig = defaultSettings;

// Helper untuk mencari tanggal kejadian berikutnya (Tahun ini atau Tahun depan)
function getNextOccurrence(dateStr: string): string {
  if (!dateStr) return new Date().toISOString();
  const baseDate = new Date(dateStr);
  const now = new Date();
  
  // Coba buat tanggal di tahun sekarang
  const next = new Date(now.getFullYear(), baseDate.getMonth(), baseDate.getDate());
  
  // Jika sudah lewat, geser ke tahun depan
  if (next < now) {
    next.setFullYear(now.getFullYear() + 1);
  }
  
  return next.toISOString();
}

// Cek apakah hari ini ada perayaan
export function getCelebrationStatus(config: DynamicSettings) {
  const now = new Date();
  const todayDay = now.getDate();
  const todayMonth = now.getMonth();

  const anniv = new Date(config.relationshipStart);
  const ultahA = new Date(config.birthdayCowoDate);
  const ultahB = new Date(config.birthdayCeweDate);

  if (todayDay === anniv.getDate() && todayMonth === anniv.getMonth()) {
    return { type: 'anniversary', years: now.getFullYear() - anniv.getFullYear() };
  }
  if (todayDay === ultahA.getDate() && todayMonth === ultahA.getMonth()) {
    return { type: 'birthday', name: config.partnerA, years: now.getFullYear() - ultahA.getFullYear() };
  }
  if (todayDay === ultahB.getDate() && todayMonth === ultahB.getMonth()) {
    return { type: 'birthday', name: config.partnerB, years: now.getFullYear() - ultahB.getFullYear() };
  }

  return null;
}

export async function getLiveSettings(): Promise<DynamicSettings> {
  if (!supabase) return defaultSettings;
  try {
    // Memaksa Supabase/Next.js untuk tidak menggunakan cache
    const { data } = await supabase
      .from('settings')
      .select('key, value')
      .order('updated_at', { ascending: false }); // Ambil yang paling baru diupdate
    
    if (!data) return defaultSettings;
    const mapped: any = { ...defaultSettings };
    
    data.forEach((item) => {
      if (!item.value) return;
      if (item.key === 'partner_a_name') mapped.partnerA = item.value;
      if (item.key === 'partner_b_name') mapped.partnerB = item.value;
      if (item.key === 'partner_a_location') mapped.partnerALocation = item.value;
      if (item.key === 'partner_b_location') mapped.partnerBLocation = item.value;
      if (item.key === 'gallery_layout') mapped.galleryLayout = item.value;
      if (item.key === 'music_url') mapped.musicUrl = item.value;
      if (item.key === 'romantic_quote') mapped.quote = item.value;
      if (item.key === 'relationship_start') mapped.relationshipStart = item.value;
      if (item.key === 'birthday_cowo_date') mapped.birthdayCowoDate = item.value;
      if (item.key === 'birthday_cewe_date') mapped.birthdayCeweDate = item.value;
    });

    // AUTO CALCULATE COUNTDOWN TARGETS
    mapped.anniversaryDate = getNextOccurrence(mapped.relationshipStart);
    mapped.birthdayCowoDate = getNextOccurrence(mapped.birthdayCowoDate);
    mapped.birthdayCeweDate = getNextOccurrence(mapped.birthdayCeweDate);

    return mapped;
  } catch {
    return defaultSettings;
  }
}
