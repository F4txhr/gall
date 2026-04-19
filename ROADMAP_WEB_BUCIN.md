# 📋 Roadmap Web Bucin

## Phase 1: Setup & Infrastructure
- [x] 1. Setup project structure & tech stack
  - Init Next.js project
  - Install dependencies (Tailwind, Framer Motion, Firebase/Supabase, node-telegram-bot-api)
  - Setup folder structure
  - Apply color scheme & global styles
- [x] 2. Create Telegram bot for configuration
  - Bot setup & webhook
  - Commands: `/setname`, `/setbirthday`, `/setanniversary`, `/setpassword`, `/settelegram`, `/status`, `/wish`
  - ID mapping (siapa A, siapa B)
- [x] 3. Setup database schema

## Phase 2: Core Features
- [x] 4. Build login system (cowo/cewe auth)
  - Simple auth (cowologin/cewelogin)
  - Session management
  - Redirect based on role
- [x] 5. Create hero section with typing animation
  - Nama pasangan dengan typing animation
  - Romantic quote fade-in
  - Scroll indicator
- [x] 6. Build love counter (real-time duration)
  - Real-time duration counter
  - Animated numbers
  - Label (hari:jam:menit:detik)
- [x] 7. Build birthday & anniversary countdown
  - Countdown timer
  - Progress bar
  - Tab switcher

## Phase 3: Celebration Features
- [x] 8. Create birthday/anniversary celebration flow (AI-Powered)
  - [x] Step 1: Ucapan & Headline Dinamis
  - [x] Step 2: Tombol "Start Celebration" (Auto-play musik)
  - [x] Step 3: Generasi pesan romantis unik via AI (Groq/OpenAI)
  - [x] Step 4: Make a wish (Input & Simpan)
  - [x] Step 5: Slideshow kenangan otomatis
- [x] 9. Build AI Message & Quote Generator
  - [x] API route `/api/ai/message` & `/api/ai/quote`
  - [x] Auto-sanitization (hapus `<think>`, limit kata)
  - [x] Feature "Generate Lagi" untuk pesan baru
- [ ] 10. Implement persistent storage for wishes
  - [x] Save to localStorage
  - [ ] Sync ke database (Supabase/Firebase) agar pasangan bisa lihat
  - [ ] Auto backup wish ke Telegram bot
- [ ] 11. Interactive Memory Slideshow
  - [x] Auto-play slide (interval 2.5s)
  - [x] Source from `NEXT_PUBLIC_MEMORY_IMAGE_URLS`
  - [ ] Fitur upload foto langsung dari UI

## Phase 4: Animations & Effects
- [ ] 12. Create confetti animation (canvas-based)
  - Canvas-based particles
  - Physics (gravity, wind)
  - Trigger saat "Start Celebration" atau "Save Wish"
- [x] 13. Add sound effects & music
  - [x] Instrumental ultah/romantis (auto-play on start)
  - [ ] Volume control & mute toggle
- [ ] 14. Build real-time silhouette viewer
  - SVG custom silhouette (bukan emoji)
  - Online detection (WebSocket/Firebase)
  - Animasi breathing/pulse
  - Text: "Si X sedang merayakan ultahmu"

## Phase 5: Film Roll & Photos
- [ ] 15. Create film roll background with auto-add photos
  - SVG film roll strip
  - Auto-scroll animation
  - Vintage effect
  - Low opacity (10-20%)
- [ ] 16. Build photo upload feature
  - Upload form
  - Auto add to film roll
  - Backup ke Telegram

## Phase 6: Telegram Integration
- [ ] 17. Setup Telegram auto-backup (wishes, photos, notes)
  - Wish entries → Telegram
  - Photos → Telegram
  - Notes → Telegram
- [ ] 18. Setup Telegram notifications (online, events, reminders)
  - Partner online → notif
  - Ultah/anniv hari ini → notif
  - Reminder H-7, H-1, H-0
- [ ] 19. Build reminder via web button
  - Button "Ingatkan Pasangan"
  - Send notif ke Telegram pasangan
  - Conditional (kalau belum online)

## Phase 7: Polish & Responsive
- [ ] 20. Implement responsive design (mobile/tablet/desktop)
  - Mobile-first
  - Tablet optimization
  - Desktop layout
- [ ] 21. Apply color scheme (grey, gold, cream, navy)
  - Grey (#2D2D2D, #4A4A4A, #E8E8E8)
  - Gold (#D4A574)
  - Cream (#FFF8F0, #F5F0EB)
  - Navy (#1B3A4B)
  - Warm brown (#8B6F47, #C97B5A)
- [ ] 22. Test & polish all animations & interactions
  - All animations smooth
  - Sound working
  - Realtime sync tested
  - Cross-browser testing

---

## 🎨 Color Palette
| Element | Warna |
|---------|-------|
| Background | `#2D2D2D` (dark grey) |
| Card | `#4A4A4A` (medium grey) |
| Text utama | `#F5F0EB` (warm white) |
| Text sekunder | `#E8E8E8` (light grey) |
| Tombol CTA | `#D4A574` (gold) |
| Hover | `#C97B5A` (warm orange) |
| Counter box | `#FFF8F0` (cream) |
| Kue | `#8B6F47` (brown) + `#D4A574` (gold) |
| Api lilin | `#FF9B5C` (orange) + gradient |

## 📐 Layout
- Single page dengan scroll sections
- Navbar (fixed)
- Hero (full screen)
- Love Counter (full screen)
- Countdown Section
- Birthday/Anniv Celebration (hidden, muncul pas hari-H)
- Film Roll Background (auto-scroll)
- Footer

## 📱 Tech Stack
- **Frontend:** Next.js + Tailwind CSS
- **Animasi:** Framer Motion + Canvas
- **Realtime:** Firebase/Supabase atau WebSocket
- **Telegram Bot:** Node.js (node-telegram-bot-api)
- **Database:** Firebase/Supabase
- **Audio:** Web Audio API
