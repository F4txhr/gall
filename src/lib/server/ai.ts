const RAW_BASE_URL = process.env.AI_BASE_URL;
const RAW_MODEL = process.env.AI_MODEL;
const AI_API_KEY = process.env.AI_API_KEY;

type ChatMessage = { role: 'system' | 'user'; content: string };

type ResolvedConfig = {
  baseUrl: string;
  model: string;
  provider: 'groq' | 'openai' | 'custom';
};

function resolveConfig(): ResolvedConfig {
  const key = AI_API_KEY ?? '';

  if (RAW_BASE_URL) {
    // Guardrail for common mismatch: Groq key + OpenAI base URL
    if (key.startsWith('gsk_') && RAW_BASE_URL.includes('openai.com')) {
      return {
        baseUrl: 'https://api.groq.com/openai/v1',
        model: RAW_MODEL ?? 'openai/gpt-oss-20b',
        provider: 'groq',
      };
    }

    return {
      baseUrl: RAW_BASE_URL,
      model: RAW_MODEL ?? 'openai/gpt-oss-20b',
      provider: 'custom',
    };
  }

  if (key.startsWith('gsk_')) {
    return {
      baseUrl: 'https://api.groq.com/openai/v1',
      model: RAW_MODEL ?? 'openai/gpt-oss-20b',
      provider: 'groq',
    };
  }

  if (key.startsWith('sk-')) {
    return {
      baseUrl: 'https://api.openai.com/v1',
      model: RAW_MODEL ?? 'gpt-4o-mini',
      provider: 'openai',
    };
  }

  return {
    baseUrl: RAW_BASE_URL ?? 'https://api.groq.com/openai/v1',
    model: RAW_MODEL ?? 'openai/gpt-oss-20b',
    provider: 'custom',
  };
}

export async function generateWithAI(messages: ChatMessage[], label: string): Promise<string | null> {
  if (!AI_API_KEY) {
    console.error(`[AI:${label}] Missing AI_API_KEY`);
    return null;
  }

  const cfg = resolveConfig();

  if (AI_API_KEY.startsWith('gsk_') && cfg.baseUrl.includes('openai.com')) {
    console.error(`[AI:${label}] Config mismatch: Groq key detected but OpenAI base URL is configured.`);
    return null;
  }

  const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${AI_API_KEY}`,
    },
    body: JSON.stringify({
      model: cfg.model,
      temperature: 1,
      messages,
    }),
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`[AI:${label}] Provider=${cfg.provider} error ${res.status}: ${text.slice(0, 260)}`);
    return null;
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = data.choices?.[0]?.message?.content?.trim() ?? null;
  console.info(`[AI:${label}] provider=${cfg.provider} model=${cfg.model} content=${content?.slice(0, 180) ?? 'null'}`);

  return content;
}
