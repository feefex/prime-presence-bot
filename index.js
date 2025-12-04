// index.js
import axios from 'axios';
import { Client, GatewayIntentBits, ActivityType } from 'discord.js';

const BOT_TOKEN = process.env.BOT_TOKEN;
const STATUS_URL = process.env.STATUS_URL;

if (!BOT_TOKEN) {
  console.error('❌ BOT_TOKEN não definido nas variáveis de ambiente');
  process.exit(1);
}

if (!STATUS_URL) {
  console.error('❌ STATUS_URL não definido nas variáveis de ambiente');
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

async function buscarStatus() {
  try {
    const response = await axios.get(STATUS_URL, { timeout: 5000 });
    const data = response.data;

    // LOG pra debug – aparece em Deploy Logs do Railway
    console.log('[STATUS JSON]', JSON.stringify(data));

    let activityText = '🔴 Servidor OFFLINE';
    let statusDiscord = 'dnd'; // "ocupado" (vermelho)

    if (data && typeof data === 'object') {
      // Alguns jeitos comuns de marcar offline no JSON
      const offlineFlags = [
        data.online === false,
        String(data.status).toLowerCase() === 'offline',
        String(data.slots).toLowerCase() === 'offline'
      ];

      const isOffline = offlineFlags.some(Boolean);

      if (!isOffline) {
        // Tenta descobrir players e maxPlayers em vários nomes possíveis
        const players = Number(
          data.playersOnline ??
          data.players ??
          data.onlinePlayers ??
          data.player_count ??
          0
        );

        const maxPlayers = Number(
          data.maxPlayers ??
          data.max_players ??
          data.slotsMax ??
          data.max ??
          data.max_player_count ??
          0
        );

        if (!Number.isNaN(maxPlayers) && maxPlayers > 0) {
          activityText = `🟢 ${players}/${maxPlayers} jogadores online`;
        } else {
          activityText = `🟢 ${players} jogadores online`;
        }

        statusDiscord = 'online';
      }
    }

    client.user.setPresence({
      activities: [{ name: activityText, type: ActivityType.Playing }],
      status: statusDiscord
    });

  } catch (err) {
    console.error('Erro ao buscar STATUS_URL:', err.message || err);
    // Se der erro (site fora, JSON quebrado, etc), consideramos OFFLINE
    client.user.setPresence({
      activities: [{ name: '🔴 Servidor OFFLINE', type: ActivityType.Playing }],
      status: 'dnd'
    });
  }
}

client.once('ready', () => {
  console.log(`✅ Logado como ${client.user.tag}`);

  // Atualiza logo que liga
  buscarStatus();

  // E depois de tempos em tempos (ex.: 30 segundos)
  setInterval(buscarStatus, 30 * 1000);
});

client.login(BOT_TOKEN);
