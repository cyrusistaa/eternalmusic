require('dotenv').config();

const { REST, Routes } = require('discord.js');
const { commands } = require('../src/commands');

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env: ${name}`);
  return value;
}

async function main() {
  const token = requiredEnv('DISCORD_TOKEN');
  const clientId = requiredEnv('DISCORD_CLIENT_ID');
  const guildId = process.env.DISCORD_GUILD_ID;

  const rest = new REST({ version: '10' }).setToken(token);
  const body = commands.map((c) => c.data.toJSON());

  if (guildId) {
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body });
    console.log(`Registered ${body.length} guild commands for ${guildId}`);
    return;
  }

  await rest.put(Routes.applicationCommands(clientId), { body });
  console.log(`Registered ${body.length} global commands (may take up to ~1h to propagate)`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

