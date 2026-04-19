# Deploy Web Bucin di Vercel + Firebase/Supabase

## Bisa nggak dipakai bareng?
**Bisa.** Deploy frontend/backend Next.js ke Vercel tetap kompatibel dengan Firebase ataupun Supabase.

## Rekomendasi arsitektur
- **Vercel**: hosting Next.js (App Router + API routes).
- **Firebase / Supabase**: database, auth, storage, realtime (sesuai kebutuhan fitur).

## Catatan penting saat deploy
1. **Environment variables**
   - Isi semua `NEXT_PUBLIC_*` dan secret server vars di:
     - Vercel Project → Settings → Environment Variables.
2. **Server secret jangan pakai `NEXT_PUBLIC_`**
   - Semua key rahasia (service role key, bot token) harus server-only env.
3. **Region & latency**
   - Pilih region Vercel yang dekat dengan region project Firebase/Supabase.
4. **File upload**
   - Hindari simpan file di local filesystem Vercel (ephemeral).
   - Simpan ke Firebase Storage / Supabase Storage.
5. **Telegram bot**
   - Untuk production, lebih stabil pakai webhook endpoint daripada polling long-running.

## Kapan pilih Firebase vs Supabase?
- **Firebase cocok** jika mau cepat pakai ecosystem Google (Firestore, Storage, FCM).
- **Supabase cocok** jika ingin PostgreSQL, SQL query, dan kontrol schema lebih kuat.

## Saran untuk project ini
Karena roadmap kamu butuh realtime + upload foto + backup/automation:
- Pilih salah satu provider dulu sebagai source of truth (jangan dua-duanya sekaligus di awal).
- Prioritas implementasi stabil:
  1. Auth + profile pasangan
  2. Wishes + memories table/collection
  3. Storage foto kenangan
  4. Realtime online status
