// index.js
import 'dotenv/config';
import { Client, GatewayIntentBits, ActivityType } from 'discord.js';
import fetch from 'node-fetch';

const TOKEN = process.env.BOT_TOKEN;
const STATUS_URL = process.env.STATUS_URL;

// de quanto em quanto tempo o bot vai atualizar a presença (em ms)
const UPDATE_INTERVAL_MS = 15_000; // 15s

// quanto tempo sem atualizar o status.json a gente considera "offline" (em segundos)
const OFFLINE_THRESHOLD_SECONDS = 60; // ajusta se quiser

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

function setOfflinePresence(motivo = 'offline') {
  if (!client.user) return;

  const texto =
    motivo === 'erro'
      ? 'Servidor indisponível'
      : 'Servidor OFFLINE';

  client.user.setPresence({
    activities: [
      {
        name: texto,
        type: ActivityType.Watching,
      },
    ],
    status: 'idle', // pode trocar pra 'dnd' se quiser
  });

  console.log(`Presença ajustada para: ${texto}`);
}

async function updatePresence() {
  if (!client.user) return;

  try {
    const res = await fetch(STATUS_URL, { timeout: 5000 });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();

    const online = Number(data.online ?? 0);
    const max = Number(data.max ?? 0);
    const ts = Number(data.timestamp ?? 0);
    const now = Math.floor(Date.now() / 1000);

    const isStale = !ts || now - ts > OFFLINE_THRESHOLD_SECONDS;

    if (isStale) {
      // status.json está velho -> servidor provavelmente offline
      setOfflinePresence('offline');
      return;
    }

    // servidor online, atualiza com X/Y jogadores
    client.user.setPresence({
      activities: [
        {
          name: `${online}/${max} jogadores online`,
          type: ActivityType.Watching,
        },
      ],
      status: 'online',
    });

    console.log(`Presença: ${online}/${max} jogadores online`);
  } catch (err) {
    console.error('Erro ao buscar status.json:', err.message);
    // se der erro de rede / parse, também marca como offline
    setOfflinePresence('erro');
  }
}

client.once('ready', () => {
  console.log(`Bot logado como ${client.user.tag}`);
  updatePresence();
  setInterval(updatePresence, UPDATE_INTERVAL_MS);
});

client.login(TOKEN);
