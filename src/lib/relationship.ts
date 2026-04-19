import { supabase } from './supabase';

export type DynamicSettings = {
  partnerA: string;
  partnerB: string;
  quote: string;
  relationshipStart: string;
  anniversaryDate: string;
  birthdayCowoDate: string;
  birthdayCeweDate: string;
};

const defaultSettings: DynamicSettings = {
  partnerA: process.env.NEXT_PUBLIC_PARTNER_A_NAME ?? 'Kamu',
  partnerB: process.env.NEXT_PUBLIC_PARTNER_B_NAME ?? 'Dia',
  quote: process.env.NEXT_PUBLIC_ROMANTIC_QUOTE ?? 'Setiap detik bersamamu adalah rumah.',
  relationshipStart: process.env.NEXT_PUBLIC_RELATIONSHIP_START ?? '2024-01-01T00:00:00+07:00',
  anniversaryDate: process.env.NEXT_PUBLIC_ANNIVERSARY_DATE ?? '2026-10-17T00:00:00+07:00',
  birthdayCowoDate: process.env.NEXT_PUBLIC_BIRTHDAY_COWO_DATE ?? '2026-12-01T00:00:00+07:00',
  birthdayCeweDate: process.env.NEXT_PUBLIC_BIRTHDAY_CEWE_DATE ?? '2026-08-20T00:00:00+07:00',
};

export const relationshipConfig = defaultSettings;

// Cek apakah hari ini ada perayaan
export function getCelebrationStatus(config: DynamicSettings) {
  const now = new Date();
  const today = { day: now.getDate(), month: now.getMonth() };

  const anniv = new Date(config.relationshipStart);
  const ultahA = new Date(config.birthdayCowoDate);
  const ultahB = new Date(config.birthdayCeweDate);

  if (today.day === anniv.getDate() && today.month === anniv.getMonth()) {
    return { type: 'anniversary', years: now.getFullYear() - anniv.getFullYear() };
  }
  if (today.day === ultahA.getDate() && today.month === ultahA.getMonth()) {
    return { type: 'birthday', name: config.partnerA, years: now.getFullYear() - ultahA.getFullYear() };
  }
  if (today.day === ultahB.getDate() && today.month === ultahB.getMonth()) {
    return { type: 'birthday', name: config.partnerB, years: now.getFullYear() - ultahB.getFullYear() };
  }

  return null;
}

export async function getLiveSettings(): Promise<DynamicSettings> {
  if (!supabase) return defaultSettings;
  try {
    const { data } = await supabase.from('settings').select('key, value');
    if (!data) return defaultSettings;
    const mapped: any = { ...defaultSettings };
    data.forEach((item) => {
      if (item.key === 'partner_a_name') mapped.partnerA = item.value;
      if (item.key === 'partner_b_name') mapped.partnerB = item.value;
      if (item.key === 'romantic_quote') mapped.quote = item.value;
    });
    return mapped;
  } catch {
    return defaultSettings;
  }
}
