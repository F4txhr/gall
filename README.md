# Web Bucin

Progress implementasi roadmap:
- **Phase 1:** Setup & infrastructure ✅
- **Phase 2:** Login system + Hero typing + Love Counter + Countdown cards ✅
- **Phase 3 (initial):** Celebration flow + make-a-wish local storage + blow candle click ✅

## Fitur yang sudah aktif
- Login role-based (`cowo` / `cewe`) dengan session cookie
- Redirect auth via middleware (`/login` ↔ `/app/{role}`)
- Hero section dengan typing animation nama pasangan
- Real-time love counter (hari/jam/menit/detik)
- Countdown tampil langsung semua per-card ke bawah:
  - Anniversary
  - Ulang tahun cowo
  - Ulang tahun cewe
- **Birthday full-screen takeover** saat ultah + bisa dipaksa tampil untuk test:
  - `/?birthday=1`
  - `/birthday`
- Celebration flow 5 step (UI dipoles dengan stepper + cake visual):
  - Ucapan
  - Tombol lihat kejutan
  - Kue + lilin
  - Make a wish (tersimpan localStorage)
  - Tiup lilin (klik)
- Telegram bot scaffold commands (`/setname`, `/setbirthday`, `/setanniversary`, `/setpassword`, `/settelegram`, `/status`, `/wish`)

## Endpoint API auth
- `POST /api/login`
- `POST /api/logout`
- `GET /api/me`

## Run locally
1. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start development server:
   ```bash
   npm start
   ```
4. Open:
   - `http://localhost:3000/`
   - `http://localhost:3000/login`

Default credentials:
- cowo → `cowologin`
- cewe → `cewelogin`

## Termux quick fix for `ENOENT: package.json`
Jika muncul:

`npm ERR! enoent Could not read package.json`

jalankan dari root repo:

```bash
git status
git pull
ls -la
```

Pastikan ada `package.json`, `next.config.mjs`, dan folder `src/` sebelum `npm install`.
