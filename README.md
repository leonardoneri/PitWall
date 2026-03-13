<div align="center">
  <h1>🏎️ PitWall</h1>
  <p>Discord bot that notifies about F1 race weeks — session schedules, automatic reminders, results and championship standings.</p>

  ![Node.js](https://img.shields.io/badge/Node.js-22+-339933?style=flat-square&logo=node.js&logoColor=white)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5.5+-3178C6?style=flat-square&logo=typescript&logoColor=white)
  ![discord.js](https://img.shields.io/badge/discord.js-v14-5865F2?style=flat-square&logo=discord&logoColor=white)
  ![License](https://img.shields.io/badge/license-MIT-e8010d?style=flat-square)
</div>

---

## Features

- 📅 **Session schedule** — posts race week timetable every Monday morning
- ⏰ **Automatic reminders** — notifies the channel X minutes before each session
- 🏁 **Results** — posts classification after each session ends
- 🏆 **Standings** — drivers and constructors championship on demand

## Stack

- **Node.js** + **TypeScript**
- **discord.js v14**
- **node-cron** — scheduled jobs
- **OpenF1 API** — real-time session data
- **Jolpica API** — championship standings
- **Zod** — environment variable validation

## Project structure

```
src/
  commands/     → slash commands (/schedule, /results, /standings)
  jobs/         → cron jobs (schedule, reminder, results)
  services/     → OpenF1 API client
  embeds/       → Discord embed builders
  types/        → TypeScript interfaces
  utils/        → date formatting, emojis
  config.ts     → env vars validated with Zod
  index.ts      → entry point
  deploy-commands.ts
```

## Setup

### 1. Clone and install

```bash
git clone https://github.com/your-username/f1-bot
cd f1-bot
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `DISCORD_TOKEN` | Bot token from Discord Developer Portal |
| `DISCORD_CLIENT_ID` | Application ID |
| `DISCORD_GUILD_ID` | Server ID (optional — for faster command deploy) |
| `DISCORD_CHANNEL_ID` | Channel where the bot will post automatically |
| `TIMEZONE` | Timezone for session times (default: `America/Sao_Paulo`) |
| `REMINDER_MINUTES_BEFORE` | Minutes before session to send reminder (default: `30`) |

### 3. Create the Discord bot

1. Go to [discord.com/developers/applications](https://discord.com/developers/applications)
2. Create a new Application
3. Under **Bot**, create the bot and copy the token
4. Under **OAuth2 → URL Generator**, select scopes `bot` + `applications.commands`
5. Bot permissions: `Send Messages`, `Embed Links`, `Read Message History`
6. Use the generated URL to add the bot to your server

### 4. Register slash commands

```bash
npm run deploy-commands
```

### 5. Run

```bash
# Development (hot reload)
npm run dev

# Production
npm run build && npm start
```

## Slash commands

| Command | Description |
|---|---|
| `/schedule` | Shows current race week timetable |
| `/results` | Shows latest session results |
| `/standings` | Championship standings (drivers or constructors) |

## Automatic jobs

| Job | When | What |
|---|---|---|
| Schedule | Every Monday at 08:00 | Posts race week timetable |
| Reminder | Every minute (checks) | Notifies X min before each session |
| Results | Every 5 minutes (checks) | Posts results after session ends |

## Deploy (Railway)

1. Push the repo to GitHub
2. Create an account at [railway.app](https://railway.app)
3. **New Project → Deploy from GitHub repo**
4. Select the repository
5. Add all `.env` variables under **Variables**
6. Railway auto-detects Node.js and builds with Nixpacks

## License

MIT