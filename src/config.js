function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env: ${name}`);
  return value;
}

function optionalEnv(name) {
  const value = process.env[name];
  return value && value.length ? value : undefined;
}

module.exports = {
  requiredEnv,
  optionalEnv,
  getConfig() {
    return {
      discordToken: requiredEnv('DISCORD_TOKEN'),
      discordClientId: requiredEnv('DISCORD_CLIENT_ID'),
      discordGuildId: optionalEnv('DISCORD_GUILD_ID'),
      idleVoiceChannelId: optionalEnv('IDLE_VOICE_CHANNEL_ID'),
      spotifyClientId: optionalEnv('SPOTIFY_CLIENT_ID'),
      spotifyClientSecret: optionalEnv('SPOTIFY_CLIENT_SECRET')
    };
  }
};

