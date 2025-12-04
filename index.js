// index.js
import { Client, GatewayIntentBits, ActivityType } from 'discord.js';

const TOKEN = process.env.BOT_TOKEN;
const STATUS_URL = process.env.STATUS_URL;

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

// Busca o status no seu status.json
async function getStatus() {
  try {
    const res = await fetch(STATUS_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Erro ao buscar status:', err.message);
    return null;
  }
}

// Atualiza a presença do bot
async function updatePresence() {
  const status = await getStatus();

  // Qualquer problema => OFFLINE
  if (
    !status ||
    !status.online ||
    typeof status.players !== 'number' ||
    typeof status.maxPlayers !== 'number'
  ) {
    await setOfflinePresence();
    return;
  }

  const { players, maxPlayers } = status;

  await client.user.setPresence({
    status: 'online',
    activities: [
      {
        type: ActivityType.Watching,
        name: `🟢 ${players}/${maxPlayers} jogadores online`,
      },
    ],
  });

  console.log(`Atualizei presença: ${players}/${maxPlayers} online`);
}

// Presença quando servidor estiver offline
async function setOfflinePresence() {
  await client.user.setPresence({
    status: 'dnd',
    activities: [
      {
        type: ActivityType.Watching,
        name: '🔴 Servidor OFFLINE',
      },
    ],
  });

  console.log('Servidor OFFLINE – presença ajustada');
}

// Quando o bot logar
client.once('ready', () => {
  console.log(`Logado como ${client.user.tag}`);

  // Atualiza na hora e depois a cada 30s
  updatePresence();
  setInterval(updatePresence, 30_000);
});

client.login(TOKEN);
