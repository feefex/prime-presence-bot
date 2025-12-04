client.login(BOT_TOKEN);
const { Client, GatewayIntentBits, ActivityType } = require("discord.js");
const axios = require("axios");

// Variáveis de ambiente do Railway
const TOKEN = process.env.BOT_TOKEN;
const STATUS_URL = process.env.STATUS_URL || "https://primextincao.com/status.json";
const UPDATE_INTERVAL = Number(process.env.UPDATE_INTERVAL || 30000); // 30s

if (!TOKEN) {
  console.error("ERRO: BOT_TOKEN não definido nas variáveis de ambiente.");
  process.exit(1);
}

if (!STATUS_URL) {
  console.error("ERRO: STATUS_URL não definido nas variáveis de ambiente.");
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

async function atualizarStatus() {
  try {
    const response = await axios.get(STATUS_URL, { timeout: 5000 });
    const data = response.data;

    const online = data.online ?? 0;
    const max = data.max ?? 0;

    await client.user.setPresence({
      activities: [
        {
          name: `🟢${online}/${max} jogadores online`,
          type: ActivityType.Playing
        }
      ],
      status: "online"
    });

    console.log(`Status atualizado: ${online}/${max}`);
  } catch (err) {
    console.error("Erro ao atualizar status:", err.message);
  }
}

client.once("ready", () => {
  console.log(`Bot logado como ${client.user.tag}`);
  atualizarStatus();
  setInterval(atualizarStatus, UPDATE_INTERVAL);
});

client.login(TOKEN).catch(err => {
  console.error("Erro ao logar no Discord:", err.message);
  process.exit(1);
});
