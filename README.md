# Web Bucin

Initial implementation for **Phase 1 (Setup & Infrastructure)** from `ROADMAP_WEB_BUCIN.md`.

## Included in this commit
- Next.js (App Router) + TypeScript setup
- Tailwind CSS setup and color palette mapping
- Framer Motion ready-to-use hero section
- Firebase + Supabase client bootstrap files
- Telegram bot command scaffolding (`/setname`, `/setbirthday`, `/setanniversary`, `/setpassword`, `/settelegram`, `/status`, `/wish`)

## Run locally
1. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start dev server:
   ```bash
   npm run dev
   ```
