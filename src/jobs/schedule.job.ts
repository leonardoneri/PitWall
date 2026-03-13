import cron from 'node-cron';
import { Client, TextChannel } from 'discord.js';
import { openF1Service } from '../services/openf1.service';
import { buildScheduleEmbed } from '../embeds/schedule.embed';
import { config } from '../config';

// Toda segunda-feira às 08:00 (horário configurado), posta o schedule da semana
export function startScheduleJob(client: Client): void {
  console.log('📅 Schedule job iniciado');

  // Seg às 08:00
  cron.schedule('0 8 * * 1', async () => {
    try {
      const meeting = await openF1Service.getCurrentMeeting();
      if (!meeting) {
        console.log('📅 Não é semana de corrida, pulando post.');
        return;
      }

      const sessions = await openF1Service.getSessions(meeting.meetingKey);
      if (!sessions.length) return;

      const channel = await client.channels.fetch(config.DISCORD_CHANNEL_ID);
      if (!channel || !(channel instanceof TextChannel)) return;

      const embed = buildScheduleEmbed(meeting, sessions);
      await channel.send({
        content: '🏎️ **É semana de corrida!** Confira os horários:',
        embeds: [embed],
      });

      console.log(`✅ Schedule postado para ${meeting.meetingName}`);
    } catch (err) {
      console.error('❌ Erro no schedule job:', err);
    }
  }, {
    timezone: config.TIMEZONE,
  });
}