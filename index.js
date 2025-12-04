import { Client, GatewayIntentBits, ActivityType } from 'discord.js';
import fetch from 'node-fetch';

const token = process.env.BOT_TOKEN;
const statusUrl = process.env.STATUS_URL;

if (!token) {
  console.error('❌ BOT_TOKEN não definido nas variáveis de ambiente');
  process.exit(1);
}

if (!statusUrl) {
  console.error('❌ STATUS_URL não definido nas variáveis de ambiente');
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

function setOfflinePresence() {
  client.user.setPresence({
    activities: [
      {
        name: 'Servidor OFFLINE',
        type: ActivityType.Custom,
        state: '🔴 Servidor OFFLINE',
      },
    ],
    status: 'dnd', // vermelho
  });

  console.log('🔴 Presença atualizada: Servidor OFFLINE');
}

async function updatePresence() {
  try {
    const res = await fetch(statusUrl, {
      headers: {
        'Cache-Control': 'no-cache',
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();

    // Seu status.json hoje está assim:
    // { "online": 2, "max": 100, "timestamp": 1764813350 }

    const online = Number(data.online);
    const max =
      data.max !== undefined
        ? Number(data.max)
        : data.maxPlayers !== undefined
        ? Number(data.maxPlayers)
        : 0;

    // Se não conseguiu ler números válidos, ou max <= 0, consideramos OFFLINE
    if (!Number.isFinite(online) || !Number.isFinite(max) || max <= 0) {
      setOfflinePresence();
      return;
    }

    const activityText = `${online}/${max} jogadores online`;

    client.user.setPresence({
      activities: [
        {
          name: activityText,
          type: ActivityType.Playing,
        },
      ],
      // Mantém o status verde mesmo com 0 players
      status: 'online',
    });

    console.log(`🟢 Presença atualizada: ${activityText}`);
  } catch (err) {
    console.error('⚠️ Erro ao buscar status.json:', err.message);
    setOfflinePresence();
  }
}

client.once('ready', () => {
  console.log(`✅ Logado como ${client.user.tag}`);

  // Atualiza imediatamente
  updatePresence();

  // E depois a cada 30 segundos
  setInterval(updatePresence, 30_000);
});

client.login(token);
