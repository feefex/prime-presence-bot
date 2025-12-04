import { Client, GatewayIntentBits, ActivityType } from 'discord.js';
import axios from 'axios';

const token = process.env.BOT_TOKEN;
const STATUS_URL = process.env.STATUS_URL;

// segurança básica
if (!token) {
  console.error('❌ BOT_TOKEN não definido');
  process.exit(1);
}
if (!STATUS_URL) {
  console.error('❌ STATUS_URL não definido');
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// função que consulta o status.json e atualiza o bot
async function updatePresence() {
  try {
    const response = await axios.get(STATUS_URL, { timeout: 5000 });
    const { online, max, status } = response.data;

    // se não for "ok", tratamos como servidor OFFLINE
    if (status !== 'ok') {
      await client.user.setPresence({
        status: 'dnd',
        activities: [
          {
            name: 'Servidor OFFLINE',
            type: ActivityType.Custom,
            state: '🔴 Servidor OFFLINE'
          }
        ]
      });
      console.log('🔴 Servidor OFFLINE (status:', status, ')');
      return;
    }

    // status ok → servidor ONLINE, mostra players
    await client.user.setPresence({
      status: 'online',
      activities: [
        {
          name: `${online}/${max} jogadores online`,
          type: ActivityType.Custom,
          state: `🟢 ${online}/${max} jogadores online`
        }
      ]
    });
    console.log(`🟢 Servidor ONLINE: ${online}/${max}`);
  } catch (err) {
    // se der erro na requisição, também considera OFFLINE
    console.error('Erro ao consultar STATUS_URL:', err.message);
    await client.user.setPresence({
      status: 'dnd',
      activities: [
        {
          name: 'Servidor OFFLINE',
          type: ActivityType.Custom,
          state: '🔴 Servidor OFFLINE'
        }
      ]
    });
  }
}

client.once('ready', () => {
  console.log(`✅ Logado como ${client.user.tag}`);
  updatePresence();
  setInterval(updatePresence, 60_000); // a cada 60s
});

client.login(token);
