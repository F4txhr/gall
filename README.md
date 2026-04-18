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
3. Start development server:
   ```bash
   npm start
   ```

## Termux quick fix for `ENOENT: package.json`
If you see:

`npm ERR! enoent Could not read package.json`

that means your local folder is not synced with the latest commit contents.

Run these commands from your repo root:

```bash
git status
git pull
ls -la
```

You should see `package.json`, `next.config.mjs`, and `src/` before running `npm install` or `npm start`.
