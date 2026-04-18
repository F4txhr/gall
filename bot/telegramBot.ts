import TelegramBot from 'node-telegram-bot-api';

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  throw new Error('TELEGRAM_BOT_TOKEN is required to run the Telegram bot.');
}

const bot = new TelegramBot(token, { polling: false });

const commands = [
  { command: 'setname', description: 'Set nama pasangan A/B' },
  { command: 'setbirthday', description: 'Set tanggal ultah pasangan' },
  { command: 'setanniversary', description: 'Set tanggal anniversary' },
  { command: 'setpassword', description: 'Set password login pasangan' },
  { command: 'settelegram', description: 'Map Telegram ID untuk pasangan A/B' },
  { command: 'status', description: 'Lihat status konfigurasi saat ini' },
  { command: 'wish', description: 'Kirim ucapan wish manual lewat bot' },
];

export async function setupBot(): Promise<void> {
  await bot.setMyCommands(commands);

  bot.onText(/^\/(setname|setbirthday|setanniversary|setpassword|settelegram|status|wish)(?:\s+(.+))?$/i, async (msg, match) => {
    const command = match?.[1]?.toLowerCase();
    const args = match?.[2] ?? '';

    await bot.sendMessage(
      msg.chat.id,
      `Command /${command} diterima.${args ? ` Argumen: ${args}` : ''}\nHandler detail akan diimplementasikan di fase berikutnya.`
    );
  });
}

export { bot };
