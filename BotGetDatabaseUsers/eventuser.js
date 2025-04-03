import dotenv from 'dotenv';
import TelegramBot from 'node-telegram-bot-api';
import { createClient } from '@supabase/supabase-js';

dotenv.config(); // Load .env

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, 'Halo! Gunakan /data untuk melihat data dari Supabase.');
});

bot.onText(/\/data/, async (msg) => {
    const { data, error } = await supabase.from('event_registrations').select('*');
    if (error) {
        return bot.sendMessage(msg.chat.id, '❌ Gagal mengambil data: ' + error.message);
    }
    if (data.length === 0) {
        return bot.sendMessage(msg.chat.id, 'ℹ️ Tidak ada data dalam tabel.');
    }

    let pesan = '📝 *Data Pendaftaran Event:*\n\n';

data.forEach((item, index) => {
    pesan += `───────── *Peserta ${index + 1}* ─────────\n`;
    pesan += `👤 *Nama:* \`${item.name || 'Tidak diisi'}\`\n`;
    pesan += `📱 *Nomor HP:* \`${item.phone || 'Tidak diisi'}\`\n`;
    pesan += `🎮 *Gamertag:* \`${item.gamertag || 'Tidak diisi'}\`\n`;
    pesan += `📧 *Email:* \`${item.email || 'Tidak diisi'}\`\n`;
    pesan += `🖥️ *Platform:* \`${item.platform || 'Tidak ditentukan'}\`\n`;
    pesan += `✅ *Setuju Syarat:* \`${item.terms_agreed ? 'Ya' : 'Tidak'}\`\n`;
    pesan += `🕒 *Waktu Daftar:* \`${new Date(item.created_at).toLocaleString() || 'Tidak diketahui'}\`\n`;
    pesan += `────────────────────────────────────\n`;
});

    bot.sendMessage(msg.chat.id, pesan, { parse_mode: 'Markdown' });
});

console.log('Bot berjalan...');