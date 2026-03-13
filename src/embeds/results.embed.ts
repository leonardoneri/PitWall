import { EmbedBuilder } from 'discord.js';
import type { SessionResult, DriverStanding, ConstructorStanding } from '../types/f1.types';
import {
  SESSION_EMOJI,
  SESSION_COLOR,
  getMedalEmoji,
  getTeamEmoji,
} from '../utils/format';

export function buildResultsEmbed(result: SessionResult): EmbedBuilder {
  const { session, results } = result;
  const emoji = SESSION_EMOJI[session.sessionName] ?? '🏎️';
  const color = SESSION_COLOR[session.sessionName] ?? SESSION_COLOR['Race'];

  const top10 = results.slice(0, 10);

  const resultLines = top10.map((d) => {
    const medal = getMedalEmoji(d.position);
    const team = getTeamEmoji(d.teamName);
    const diff = d.lapsDiff ? ` · ${d.lapsDiff}` : '';
    const fl = d.isFastestLap ? ' 🟣' : '';
    return `${medal} ${team} **${d.driverAcronym}**${diff}${fl}`;
  });

  return new EmbedBuilder()
    .setColor(color)
    .setTitle(`${emoji} Resultado — ${session.sessionName}`)
    .setDescription(
      `**${session.circuitShortName}** — ${session.countryName}\n\n` +
      resultLines.join('\n')
    )
    .addFields(
      {
        name: '🥇 Vencedor',
        value: results[0]
          ? `${getTeamEmoji(results[0].teamName)} **${results[0].fullName}** (${results[0].teamName})`
          : 'N/D',
        inline: true,
      },
      {
        name: '🟣 Volta mais rápida',
        value: results.find((d) => d.isFastestLap)?.driverAcronym ?? 'N/D',
        inline: true,
      }
    )
    .setFooter({ text: 'F1 Bot · Dados via OpenF1' })
    .setTimestamp();
}

export function buildDriverStandingsEmbed(standings: DriverStanding[]): EmbedBuilder {
  const top15 = standings.slice(0, 15);

  const lines = top15.map((d) => {
    const medal = getMedalEmoji(d.position);
    const team = getTeamEmoji(d.teamName);
    return `${medal} ${team} **${d.driverAcronym}** — ${d.points} pts`;
  });

  return new EmbedBuilder()
    .setColor(0xe8010d)
    .setTitle('🏆 Campeonato de Pilotos')
    .setDescription(lines.join('\n'))
    .setFooter({ text: 'Pit Wall · Dados via Ergast' })
    .setTimestamp();
}

export function buildConstructorStandingsEmbed(standings: ConstructorStanding[]): EmbedBuilder {
  const lines = standings.map((c) => {
    const medal = getMedalEmoji(c.position);
    const team = getTeamEmoji(c.teamName);
    return `${medal} ${team} **${c.teamName}** — ${c.points} pts`;
  });

  return new EmbedBuilder()
    .setColor(0x1c1c1c)
    .setTitle('🏗️ Campeonato de Construtores')
    .setDescription(lines.join('\n'))
    .setFooter({ text: 'Pit Wall · Dados via Ergast' })
    .setTimestamp();
}
