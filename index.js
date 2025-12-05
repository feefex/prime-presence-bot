// import "dotenv/config";  // removido porque o Railway não usa dotenv
import axios from "axios";
import { Client, GatewayIntentBits, ActivityType } from "discord.js";

// -------------------------------
// Variáveis de ambiente
// -------------------------------
const TOKEN = process.env.BOT_TOKEN || "";
const STATUS_URL = process.env.STATUS_URL || "";

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
// Função auxiliar para extrair número de jogadores
// -------------------------------
function extrairJogadores(data) {
  if (!data) return null;

  // Formatos possíveis
  if (typeof data.players === "number") return data.players;
  if (typeof data.player_count === "number") return data.player_count;
  if (typeof data.players_online === "number") return data.players_online;

  // Alguns endpoints usam estrutura aninhada
  if (data.players && typeof data.players.online === "number")
    return data.players.online;

  return null;
}

// -------------------------------
// Função que busca JSON e atualiza presença
// -------------------------------
async function atualizarStatus() {
  try {
    const response = await axios.get(STATUS_URL, { timeout: 5000 });
    const data = response.data;

    console.log("📡 Resposta da API:", JSON.stringify(data));

    const jogadores = extrairJogadores(data);

    if (jogadores === null || Number.isNaN(jogadores)) {
      throw new Error("Não foi possível identificar o campo de jogadores no JSON");
    }

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
    console.error("🔴 Erro ao obter status, definindo como OFFLINE");

    if (err.response) {
      console.error("HTTP Status:", err.response.status);
      console.error("Body:", JSON.stringify(err.response.data));
    } else {
      console.error("Erro:", err.message);
    }

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
