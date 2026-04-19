const AI_BASE_URL = process.env.AI_BASE_URL ?? 'https://api.groq.com/openai/v1';
const AI_MODEL = process.env.AI_MODEL ?? 'openai/gpt-oss-20b';
const AI_API_KEY = process.env.AI_API_KEY;

type ChatMessage = { role: 'system' | 'user'; content: string };

export async function generateWithAI(messages: ChatMessage[]): Promise<string | null> {
  if (!AI_API_KEY) return null;

  const res = await fetch(`${AI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${AI_API_KEY}`,
    },
    body: JSON.stringify({
      model: AI_MODEL,
      temperature: 0.9,
      messages,
    }),
    cache: 'no-store',
  });

  if (!res.ok) {
    return null;
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  return data.choices?.[0]?.message?.content?.trim() ?? null;
}
