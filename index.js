// index.js
import { Client, GatewayIntentBits, ActivityType } from 'discord.js';
// index.js
import { Client, GatewayIntentBits, ActivityType } from 'discord.js';

const TOKEN = process.env.BOT_TOKEN;
const STATUS_URL = process.env.STATUS_URL;


const TOKEN = process.env.BOT_TOKEN;
const STATUS_URL = process.env.STATUS_URL;

// Atualiza a cada 15 segundos
const UPDATE_INTERVAL_MS = 15_000;
// Se o status.json ficar velho demais, consideramos OFFLINE (em segundos)
const OFFLINE_THRESHOLD_SECONDS = 60;

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

function setOfflinePresence(reason = 'offline') {
  if (!client.user) return;

  const text =
    reason === 'error'
      ? '🔴 Servidor OFFLINE (indisponível)'
      : '🔴 Servidor OFFLINE';

  client.user.setPresence({
    status: 'dnd', // bolinha vermelha
    activities: [
      {
        name: text,
        type: ActivityType.Watching, // "Assistindo"
      },
    ],
  });

  console.log(`Presença ajustada para: ${text}`);
}

async function updatePresence() {
  if (!client.user) return;

  try {
    const res = await fetch(STATUS_URL, { timeout: 5000 });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();

    // Tenta se adaptar a vários formatos possíveis do status.json
    let players =
      typeof data.players === 'number'
        ? data.players
        : typeof data.online === 'number'
        ? data.online
        : 0;

    let maxPlayers =
      typeof data.maxplayers === 'number'
        ? data.maxplayers
        : typeof data.max === 'number'
        ? data.max
        : 0;

    const now = Math.floor(Date.now() / 1000);
    const ts = typeof data.timestamp === 'number' ? data.timestamp : 0;
    const isStale = ts && now - ts > OFFLINE_THRESHOLD_SECONDS;

    const isExplicitOffline =
      data.online === false ||
      data.status === 'offline' ||
      data.offline === true;

    if (isExplicitOffline || isStale) {
      setOfflinePresence('offline');
      return;
    }

    // Se por algum motivo maxPlayers vier 0, evita dividir por 0 e só mostra players
    const name =
      maxPlayers > 0
        ? `🟢 ${players}/${maxPlayers} jogadores online`
        : `🟢 ${players} jogadores online`;

    client.user.setPresence({
      status: 'online',
      activities: [
        {
          name,
          type: ActivityType.Watching,
        },
      ],
    });

    console.log(`Presença: ${name}`);
  } catch (err) {
    console.error('Erro ao buscar status.json:', err.message);
    setOfflinePresence('error');
  }
}

client.once('ready', () => {
  console.log(`Bot logado como ${client.user.tag}`);
  updatePresence();
  setInterval(updatePresence, UPDATE_INTERVAL_MS);
});

client.login(TOKEN);
