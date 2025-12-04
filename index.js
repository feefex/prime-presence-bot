import fetch from 'node-fetch';
import { Client, GatewayIntentBits, ActivityType } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

const BOT_TOKEN = process.env.BOT_TOKEN;
const STATUS_URL = process.env.STATUS_URL;

async function updateStatus() {
    try {
        const response = await fetch(STATUS_URL, { timeout: 3000 });
        const data = await response.json();

        if (!data || data.online === false) {
            client.user.setPresence({
                status: "dnd",
                activities: [{
                    name: "🔴 Servidor OFFLINE",
                    type: ActivityType.Playing
                }]
            });
            return;
        }

        const players = data.players || 0;
        const maxPlayers = data.maxplayers || 100;

        client.user.setPresence({
            status: "online",
            activities: [{
                name: `🟢 ${players}/${maxPlayers} jogadores online`,
                type: ActivityType.Playing
            }]
        });

    } catch (error) {
        client.user.setPresence({
            status: "idle",
            activities: [{
                name: "🔴 Servidor OFFLINE",
                type: ActivityType.Playing
            }]
        });
    }
}

client.on("ready", () => {
    console.log(`Bot logado como ${client.user.tag}!`);
    updateStatus();
    setInterval(updateStatus, 10000);
});

client.login(BOT_TOKEN);
