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
   - Simpan ke Firebase Storage / Supabase Storage / object storage.
5. **Telegram bot**
   - Untuk production, lebih stabil pakai webhook endpoint daripada polling long-running.

## Kalau targetnya publik dan tetap gratis: cukup nggak?
Untuk skala publik, **free tier biasanya cepat habis** kalau banyak foto/video.

### Ringkasan batas gratis (cek ulang sebelum go-live)
- **Firebase Storage (lihat pricing resmi Firebase):** ada kuota gratis, contohnya storage gratis terbatas (terlihat no-cost 5 GB di pricing), lalu usage berikutnya berbayar.
  - Source: https://firebase.google.com/pricing
- **Supabase Free:** storage 1 GB, database 500 MB, egress free tier terbatas (lihat billing docs Supabase).
  - Source: https://supabase.com/docs/guides/platform/billing-on-supabase
  - Source: https://supabase.com/docs/guides/storage/pricing
  - Source: https://supabase.com/docs/guides/storage/serving/bandwidth
- **Cloudflare R2:** ada free tier storage dan dikenal tanpa egress fee langsung dari R2 (lihat pricing resmi R2).
  - Source: https://developers.cloudflare.com/r2/pricing/

## Saran realistis buat kamu (hemat biaya)
Kalau kamu mau **gratisan semaksimal mungkin** dan ada potensi user publik:
1. **Vercel (Hobby)** untuk frontend + API ringan.
2. **Supabase Free** untuk auth + metadata (wishes, user, relasi foto).
3. **Cloudflare R2** untuk file foto/video (lebih aman untuk traffic download publik).
4. Aktifkan **budget alert** / monitoring usage dari awal.

## Kapan pilih Firebase vs Supabase?
- **Firebase cocok** jika mau cepat pakai ecosystem Google (Firestore, Storage, FCM).
- **Supabase cocok** jika ingin PostgreSQL, SQL query, dan kontrol schema lebih kuat.

## Saran implementasi bertahap untuk project ini
Karena roadmap butuh realtime + upload foto + backup/automation:
1. Auth + profile pasangan
2. Wishes + memories table/collection
3. Storage foto/video
4. Realtime online status
5. Telegram backup/notif
