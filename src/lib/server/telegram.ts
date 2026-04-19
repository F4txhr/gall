const getEnvToken = () => process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN || '';
const getChatIdCowo = () => process.env.TELEGRAM_CHAT_ID_COWO || '';
const getChatIdCewe = () => process.env.TELEGRAM_CHAT_ID_CEWE || '';

export async function sendTelegramNotification(target: 'cowo' | 'cewe' | 'both', message: string) {
  const token = getEnvToken().trim();
  
  if (!token) {
    console.error('[TELEGRAM] ❌ No token found in .env (Check TELEGRAM_BOT_TOKEN)');
    return;
  }

  const send = async (chatId: string, label: string) => {
    const cid = chatId.toString().trim();
    if (!cid) return;

    try {
      console.info(`[TELEGRAM] Sending to ${label}: ${token.slice(0, 4)}...${token.slice(-4)}`);
      
      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: cid,
          text: message,
          parse_mode: 'Markdown',
        }),
      });

      const data = await res.json();
      if (res.ok) {
        console.info(`[TELEGRAM] ✅ Success notifying ${label}`);
      } else {
        console.error(`[TELEGRAM] ❌ Error ${data.error_code}: ${data.description}`);
      }
    } catch (err: any) {
      console.error(`[TELEGRAM] ❌ Network Error for ${label}:`, err.message);
    }
  };

  const cidCowo = getChatIdCowo();
  const cidCewe = getChatIdCewe();

  if (target === 'cowo' || target === 'both') await send(cidCowo, 'COWO');
  if (target === 'cewe' || target === 'both') await send(cidCewe, 'CEWE');
}
