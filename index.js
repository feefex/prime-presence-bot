// index.js original (versão funcional com online/offline)
// import "dotenv/config";  // removido para evitar erro no Railway
import axios from "axios";
import { Client, GatewayIntentBits, ActivityType } from "discord.js";

// -------------------------------
// Variáveis de ambiente
// -------------------------------
const TOKEN = process.env.BOT_TOKEN || ""; // fallback vazio
const STATUS_URL = process.env.STATUS_URL || ""; // fallback vazio

if (!TOKEN) {
  console.error("❌ BOT_TOKEN não definido nas variáveis de ambiente");
  process.exit(1);
}

if (!STATUS_URL) {
  console.error("❌ STATUS_URL não definido nas variáveis de ambiente");
  process.exit(1);
}

// -------------------------------
// Inicialização do bot
// -------------------------------
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once("ready", () => {
  console.log(`✅ Bot logado como ${client.user.tag}`);
  atualizarStatus();
  setInterval(atualizarStatus, 30000); // Atualiza a cada 30s
});

// -------------------------------
// Função que busca JSON e atualiza presença
// -------------------------------
async function atualizarStatus() {
  try {
    const response = await axios.get(STATUS_URL, { timeout: 5000 });
    const data = response.data;

    if (!data || typeof data.players !== "number") {
      throw new Error("JSON inválido ou campo 'players' ausente");
    }

    const jogadores = data.players;

    client.user.setPresence({
      activities: [
        {
          name: `${jogadores}/50 jogadores online`,
          type: ActivityType.Playing,
        },
      ],
      status: "online",
    });

    console.log(`🟢 Servidor ONLINE — ${jogadores} jogadores`);
  } catch (err) {
    console.error("🔴 Erro ao obter status, definindo como OFFLINE", err.message);

    client.user.setPresence({
      activities: [
        {
          name: `🔴 Servidor OFFLINE`,
          type: ActivityType.Playing,
        },
      ],
      status: "dnd",
    });
  }
}

// -------------------------------
// Login do bot
// -------------------------------
client.login(TOKEN).catch((err) => {
  console.error("❌ Erro ao logar no Discord:", err.message);
  process.exit(1);
});
