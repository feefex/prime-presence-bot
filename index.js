import { Client, GatewayIntentBits } from 'discord.js';

const token = process.env.BOT_TOKEN;

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once('ready', () => {
  console.log(`✅ Logado como ${client.user.tag}`);
  client.user.setPresence({
    activities: [{ name: 'Testando presença...', type: 0 }],
    status: 'online'
  });
});

client.login(token).catch(err => {
  console.error('Erro ao logar:', err);
});
