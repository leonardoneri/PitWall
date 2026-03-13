import { EmbedBuilder } from 'discord.js';
import type { F1Meeting, F1Session } from '../types/f1.types';
import {
  formatSessionDate,
  formatSessionTime,
  formatCountdown,
  SESSION_NAME_PT,
  SESSION_COLOR,
} from '../utils/format';
import { config } from '../config';

export function buildScheduleEmbed(meeting: F1Meeting, sessions: F1Session[]): EmbedBuilder {
  const sorted = [...sessions].sort(
    (a, b) => a.dateStart.getTime() - b.dateStart.getTime()
  );

  const fields = sorted.map((s) => ({
    name: `${SESSION_NAME_PT[s.sessionName] ?? s.sessionName}`,
    value: [
      `📅 ${formatSessionDate(s.dateStart)}`,
      `⏰ ${formatSessionTime(s.dateStart)} (${config.TIMEZONE.split('/')[1] ?? config.TIMEZONE})`,
      `⏱️ ${formatCountdown(s.dateStart) === 'Encerrado!' ? '~~ Encerrado~~' : `Em ${formatCountdown(s.dateStart)}`}`,
    ].join('\n'),
    inline: true,
  }));

  const flagEmoji = getFlagEmoji(meeting.countryCode);

  return new EmbedBuilder()
    .setColor(SESSION_COLOR['Race'])
    .setTitle(`${flagEmoji} ${meeting.meetingOfficialName}`)
    .setDescription(
      `📍 **${meeting.location}**, ${meeting.countryName}\n` +
      `🗓️ Semana de corrida${meeting.roundNumber ? ` · Round ${meeting.roundNumber}` : ''}`
    )
    .addFields(fields)
    .setFooter({ text: `Pit Wall · Horários em ${config.TIMEZONE}` })
    .setTimestamp();
}

export function buildReminderEmbed(session: F1Session, minutesBefore: number): EmbedBuilder {
  const emoji = SESSION_NAME_PT[session.sessionName] ?? '🏎️';
  const color = SESSION_COLOR[session.sessionName] ?? SESSION_COLOR['Race'];

  return new EmbedBuilder()
    .setColor(color)
    .setTitle(`${emoji} ${session.sessionName} em ${minutesBefore} minutos!`)
    .setDescription(
      `**${session.circuitShortName}** — ${session.countryName}\n\n` +
      `⏰ Começa às **${formatSessionTime(session.dateStart)}** (horário de Brasília)\n` +
      `⏱️ Faltam **${minutesBefore} minutos** — se prepara! 🍿`
    )
    .setFooter({ text: 'Pit Wall · Boa corrida!' })
    .setTimestamp();
}

function getFlagEmoji(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return '🏁';
  const codePoints = [...countryCode.toUpperCase()].map(
    (c) => 0x1f1e6 - 65 + c.charCodeAt(0)
  );
  return String.fromCodePoint(...codePoints);
}
