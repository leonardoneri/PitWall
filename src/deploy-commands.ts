import 'dotenv/config';
 
import { REST, Routes } from 'discord.js';
import { config } from './config';
import * as scheduleCommand from './commands/schedule.command';
import * as resultsCommand from './commands/results.command';
import * as standingsCommand from './commands/standings.command';
 
const commands = [
  scheduleCommand.data.toJSON(),
  resultsCommand.data.toJSON(),
  standingsCommand.data.toJSON(),
];
 
const rest = new REST().setToken(config.DISCORD_TOKEN);
 
(async () => {
  try {
    console.log(`🔄 Registrando ${commands.length} slash commands...`);
 
    const route = config.DISCORD_GUILD_ID
      ? Routes.applicationGuildCommands(config.DISCORD_CLIENT_ID, config.DISCORD_GUILD_ID)
      : Routes.applicationCommands(config.DISCORD_CLIENT_ID);
 
    await rest.put(route, { body: commands });
 
    console.log('✅ Slash commands registrados com sucesso!');
    console.log(commands.map((c) => `  /${c.name}`).join('\n'));
  } catch (err) {
    console.error('❌ Erro ao registrar commands:', err);
    process.exit(1);
  }
})();