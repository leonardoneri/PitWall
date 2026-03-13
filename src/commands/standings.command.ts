import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';
import { openF1Service } from '../services/openf1.service';
import {
  buildDriverStandingsEmbed,
  buildConstructorStandingsEmbed,
} from '../embeds/results.embed';

export const data = new SlashCommandBuilder()
  .setName('standings')
  .setDescription('Mostra a classificação do campeonato')
  .addStringOption((opt) =>
    opt
      .setName('tipo')
      .setDescription('Pilotos ou Construtores')
      .setRequired(false)
      .addChoices(
        { name: 'Pilotos', value: 'drivers' },
        { name: 'Construtores', value: 'constructors' }
      )
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.deferReply();

  const tipo = interaction.options.getString('tipo') ?? 'drivers';

  if (tipo === 'constructors') {
    const standings = await openF1Service.getConstructorStandings();
    const embed = buildConstructorStandingsEmbed(standings);
    await interaction.editReply({ embeds: [embed] });
  } else {
    const standings = await openF1Service.getDriverStandings();
    const embed = buildDriverStandingsEmbed(standings);
    await interaction.editReply({ embeds: [embed] });
  }
}
