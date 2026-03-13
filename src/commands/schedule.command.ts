import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';
import { openF1Service } from '../services/openf1.service';
import { buildScheduleEmbed } from '../embeds/schedule.embed';

export const data = new SlashCommandBuilder()
  .setName('schedule')
  .setDescription('Mostra os horários da semana de corrida atual');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.deferReply();

  const meeting = await openF1Service.getCurrentMeeting();

  if (!meeting) {
    await interaction.editReply('❌ Nenhum GP encontrado para essa semana.');
    return;
  }

  const sessions = await openF1Service.getSessions(meeting.meetingKey);

  if (!sessions.length) {
    await interaction.editReply('❌ Nenhuma sessão encontrada para esse GP.');
    return;
  }

  const embed = buildScheduleEmbed(meeting, sessions);
  await interaction.editReply({ embeds: [embed] });
}
