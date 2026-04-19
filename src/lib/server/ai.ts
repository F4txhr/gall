const AI_BASE_URL = process.env.AI_BASE_URL ?? 'https://api.groq.com/openai/v1';
const AI_MODEL = process.env.AI_MODEL ?? 'openai/gpt-oss-20b';
const AI_API_KEY = process.env.AI_API_KEY;

type ChatMessage = { role: 'system' | 'user'; content: string };

export async function generateWithAI(messages: ChatMessage[], label: string): Promise<string | null> {
  if (!AI_API_KEY) {
    console.error(`[AI:${label}] Missing AI_API_KEY`);
    return null;
  }

  const res = await fetch(`${AI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${AI_API_KEY}`,
    },
    body: JSON.stringify({
      model: AI_MODEL,
      temperature: 1,
      messages,
    }),
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`[AI:${label}] Provider error ${res.status}: ${text.slice(0, 300)}`);
    return null;
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = data.choices?.[0]?.message?.content?.trim() ?? null;
  console.info(`[AI:${label}] model=${AI_MODEL} content=${content?.slice(0, 180) ?? 'null'}`);

  return content;
}
