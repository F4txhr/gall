# Web Bucin

Initial implementation now covers:
- **Phase 1:** Setup & infrastructure
- **Phase 2 (partial):** Login system (cowo/cewe auth, session cookie, role-based redirect)

## Included in this commit
- Next.js (App Router) + TypeScript setup
- Tailwind CSS setup and color palette mapping
- Framer Motion hero section
- Firebase + Supabase client bootstrap files
- Telegram bot command scaffolding (`/setname`, `/setbirthday`, `/setanniversary`, `/setpassword`, `/settelegram`, `/status`, `/wish`)
- Login API endpoints: `POST /api/login`, `POST /api/logout`, `GET /api/me`
- Protected route setup with `middleware.ts` for `/app/*` and `/login`
- Role dashboards:
  - `/app/cowo`
  - `/app/cewe`

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
   - `http://localhost:3000/login`
   - login default:
     - cowo → `cowologin`
     - cewe → `cewelogin`

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
