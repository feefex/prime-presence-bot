// Bot Discord - FICA ONLINE SÓ SE O SERVIDOR RUST RESPONDER
// Simples: se o servidor estiver ONLINE → bot liga normalmente
// Se o servidor estiver OFFLINE → bot NÃO inicia e encerra automaticamente

import { Client, GatewayIntentBits, ActivityType } from 'discord.js'
import Gamedig from 'gamedig'
import Gamedig from 'gamedig'

// ===========================
// VARIÁVEIS DE AMBIENTE
// ===========================
const TOKEN = process.env.TOKEN
const RUST_IP = process.env.RUST_IP || '198.1.195.53'
const RUST_QUERY_PORT = Number(process.env.RUST_QUERY_PORT || 28017)

if (!TOKEN) {
  console.error('❌ ERRO: TOKEN não configurado no .env (variável TOKEN).')
  process.exit(1)
}

// ===========================
// FUNÇÃO PARA CHECAR SERVIDOR RUST
// ===========================
async function rustOnline() {
  try {
    await Gamedig.query({
      type: 'rust',
      host: RUST_IP,
      port: RUST_QUERY_PORT
    })
    return true
  } catch {
    return false
  }
}

// ===========================
// BOT DISCORD
// ===========================
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
})

client.on('ready', () => {
  console.log(`🤖 Bot iniciado: ${client.user.tag}`)
  client.user.setPresence({
    activities: [{ name: 'Servidor ONLINE', type: ActivityType.Playing }],
    status: 'online'
  })
})

// ===========================
// SISTEMA PRINCIPAL
// ===========================
async function start() {
  console.log('🔍 Verificando servidor Rust...')

  const online = await rustOnline()

  if (!online) {
    console.log('⛔ Servidor Rust está OFFLINE → Bot será desligado.')
    process.exit(0) // encerra o processo no Railway/PM2
  }

  console.log('✅ Servidor ONLINE → Bot iniciando...')

  client.login(TOKEN)
    .catch(err => {
      console.error('❌ Erro ao logar bot:', err)
      process.exit(1)
    })
}

start()
