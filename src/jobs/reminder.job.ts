import cron from 'node-cron';
import { Client, TextChannel } from 'discord.js';
import { openF1Service } from '../services/openf1.service';
import { buildReminderEmbed } from '../embeds/schedule.embed';
import { config } from '../config';

// Checa a cada minuto se alguma sessão começa em X minutos
export function startReminderJob(client: Client): void {
  console.log('⏰ Reminder job iniciado');

  cron.schedule('* * * * *', async () => {
    try {
      const nextSession = await openF1Service.getNextSession();
      if (!nextSession) return;

      const now = new Date();
      const diffMs = nextSession.dateStart.getTime() - now.getTime();
      const diffMin = Math.round(diffMs / 60_000);

      if (diffMin === config.REMINDER_MINUTES_BEFORE) {
        const channel = await client.channels.fetch(config.DISCORD_CHANNEL_ID);
        if (!channel || !(channel instanceof TextChannel)) return;

        const embed = buildReminderEmbed(nextSession, config.REMINDER_MINUTES_BEFORE);
        await channel.send({ embeds: [embed] });
        console.log(`✅ Lembrete enviado para ${nextSession.sessionName}`);
      }
    } catch (err) {
      console.error('❌ Erro no reminder job:', err);
    }
  });
}
