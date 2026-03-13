import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';
import { openF1Service } from '../services/openf1.service';
import { buildResultsEmbed } from '../embeds/results.embed';

export const data = new SlashCommandBuilder()
  .setName('results')
  .setDescription('Mostra o resultado da última sessão');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.deferReply();

  const result = await openF1Service.getLatestSessionResult();

  if (!result) {
    await interaction.editReply('❌ Nenhum resultado disponível no momento.');
    return;
  }

  const embed = buildResultsEmbed(result);
  await interaction.editReply({ embeds: [embed] });
}
