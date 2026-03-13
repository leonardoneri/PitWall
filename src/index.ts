import 'dotenv/config';

import {
  Client,
  GatewayIntentBits,
  Events,
  ChatInputCommandInteraction,
  Collection,
} from 'discord.js';
import { config } from './config';

// Commands
import * as scheduleCommand from './commands/schedule.command';
import * as resultsCommand from './commands/results.command';
import * as standingsCommand from './commands/standings.command';

// Jobs
import { startScheduleJob } from './jobs/schedule.job';
import { startReminderJob } from './jobs/reminder.job';
import { startResultsJob } from './jobs/results.job';

// ─── Setup ────────────────────────────────────────────────────────────────────

type Command = {
  data: { name: string; toJSON: () => unknown };
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
};

const commands = new Collection<string, Command>();

[scheduleCommand, resultsCommand, standingsCommand].forEach((cmd) => {
  commands.set(cmd.data.name, cmd);
});

// ─── Client ───────────────────────────────────────────────────────────────────

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`\n🏎️  Pit Wall online como ${readyClient.user.tag}`);
  console.log(`📡 Conectado em ${readyClient.guilds.cache.size} servidor(es)\n`);

  // Inicia os cron jobs
  startScheduleJob(client);
  startReminderJob(client);
  startResultsJob(client);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = commands.get(interaction.commandName);

  if (!command) {
    console.warn(`⚠️  Comando desconhecido: ${interaction.commandName}`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(`❌ Erro ao executar /${interaction.commandName}:`, err);

    const reply = { content: '❌ Ocorreu um erro ao executar esse comando.', ephemeral: true };

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(reply);
    } else {
      await interaction.reply(reply);
    }
  }
});

// ─── Start ────────────────────────────────────────────────────────────────────

client.login(config.DISCORD_TOKEN);

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled rejection:', err);
});