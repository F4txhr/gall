# Free AI model options (untuk generate kata-kata & romantic quote)

## Rekomendasi utama (langsung kompatibel dengan kode sekarang)
OpenAI-compatible ≠ OpenAI langsung.

### 1) Groq Free Plan (OpenAI-compatible)
- Base URL: `https://api.groq.com/openai/v1`
- Contoh model: `openai/gpt-oss-20b`
- Kenapa cocok: API-nya kompatibel format OpenAI, jadi cukup set env tanpa ubah kode route.
- Referensi resmi:
  - https://console.groq.com/docs/rate-limits
  - https://console.groq.com/docs/models

## Alternatif
### 2) OpenRouter free router
- Base URL: `https://openrouter.ai/api/v1`
- Model: `openrouter/free` (router ke model gratis)
- Catatan: kualitas/stabilitas bisa naik turun tergantung model yang diroute saat itu.
- Referensi resmi:
  - https://openrouter.ai/openrouter/free//api
  - https://openrouter.ai/docs/models

### 3) Gemini Developer API free tier
- Tersedia free tier (cek pricing resmi), tapi endpoint-nya tidak identik dengan OpenAI chat completion.
- Kalau mau Gemini native, perlu adapter khusus atau SDK Gemini.
- Referensi resmi:
  - https://ai.google.dev/pricing

## Set env cepat (pilihan Groq)
Isi `.env.local`:

```bash
AI_API_KEY=...
AI_BASE_URL=https://api.groq.com/openai/v1
AI_MODEL=openai/gpt-oss-20b
```

Lalu run normal:

```bash
npm start
```
