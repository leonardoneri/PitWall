import cron from 'node-cron';
import { Client, TextChannel } from 'discord.js';
import { openF1Service } from '../services/openf1.service';
import { buildResultsEmbed } from '../embeds/results.embed';
import { config } from '../config';

// Sessões que já tiveram resultado postado (evita duplicar)
const postedSessions = new Set<number>();

// Checa a cada 5 minutos se uma sessão terminou e tem resultados
export function startResultsJob(client: Client): void {
  console.log('🏁 Results job iniciado');

  cron.schedule('*/5 * * * *', async () => {
    try {
      const result = await openF1Service.getLatestSessionResult();
      if (!result) return;

      const { session } = result;

      // Já postamos esse resultado
      if (postedSessions.has(session.sessionKey)) return;

      // Sessão ainda não terminou
      if (session.dateEnd > new Date()) return;

      // Sessão terminou há mais de 2h (muito tarde pra postar)
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      if (session.dateEnd < twoHoursAgo) {
        postedSessions.add(session.sessionKey);
        return;
      }

      const channel = await client.channels.fetch(config.DISCORD_CHANNEL_ID);
      if (!channel || !(channel instanceof TextChannel)) return;

      const embed = buildResultsEmbed(result);
      await channel.send({ embeds: [embed] });

      postedSessions.add(session.sessionKey);
      console.log(`✅ Resultado postado para ${session.sessionName}`);
    } catch (err) {
      console.error('❌ Erro no results job:', err);
    }
  });
}
