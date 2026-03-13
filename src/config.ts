import { z } from 'zod';

const envSchema = z.object({
  DISCORD_TOKEN: z.string().min(1, 'DISCORD_TOKEN é obrigatório'),
  DISCORD_CLIENT_ID: z.string().min(1, 'DISCORD_CLIENT_ID é obrigatório'),
  DISCORD_GUILD_ID: z.string().optional(),
  DISCORD_CHANNEL_ID: z.string().min(1, 'DISCORD_CHANNEL_ID é obrigatório'),
  TIMEZONE: z.string().default('America/Sao_Paulo'),
  REMINDER_MINUTES_BEFORE: z.coerce.number().default(30),
});

function loadConfig() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ Variáveis de ambiente inválidas:');
    parsed.error.issues.forEach((issue) => {
      console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
    });
    process.exit(1);
  }

  return parsed.data;
}

export const config = loadConfig();
export type Config = typeof config;
