require('dotenv').config();

const ffmpegPath = require('ffmpeg-static');
if (ffmpegPath) process.env.FFMPEG_PATH = ffmpegPath;

const {
  ActivityType,
  Client,
  Collection,
  GatewayIntentBits
} = require('discord.js');

const { getConfig } = require('./config');
const { commands } = require('./commands');
const { GuildMusicManager } = require('./music/manager');
const { createSpotifyResolver } = require('./music/spotify');

const cfg = getConfig();

const spotifyResolver = createSpotifyResolver({
  clientId: cfg.spotifyClientId,
  clientSecret: cfg.spotifyClientSecret
});

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates]
});

const commandByName = new Collection();
for (const c of commands) commandByName.set(c.name, c);

const musicByGuild = new Map();
function getMusic(guildId) {
  let m = musicByGuild.get(guildId);
  if (!m) {
    m = new GuildMusicManager({ guildId, spotifyResolver });
    musicByGuild.set(guildId, m);
  }
  return m;
}

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);

  client.user.setPresence({
    activities: [
      {
        name: 'Cyrus ❤ Beyaz',
        type: ActivityType.Streaming,
        url: 'https://twitch.tv/discord'
      }
    ],
    status: 'online'
  });

  if (cfg.idleVoiceChannelId) {
    try {
      const ch = await client.channels.fetch(cfg.idleVoiceChannelId);
      if (ch && ch.isVoiceBased() && ch.guild) {
        await getMusic(ch.guild.id).connect(ch);
        console.log(`Idling in voice channel: ${ch.id}`);
      }
    } catch (e) {
      console.warn('Idle voice join failed:', e?.message || e);
    }
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const cmd = interaction.commandName;
  const guild = interaction.guild;
  if (!guild) return interaction.reply({ content: 'Bu komut sadece sunucuda çalışır.', ephemeral: true });

  const member = interaction.member;
  const userVoice = member?.voice?.channel || null;
  const music = getMusic(guild.id);

  try {
    if (cmd === 'join') {
      if (!userVoice) return interaction.reply({ content: 'Önce bir ses kanalına gir.', ephemeral: true });
      await music.connect(userVoice);
      return interaction.reply(`Katıldım: <#${userVoice.id}>`);
    }

    if (cmd === 'leave') {
      music.clear();
      music.disconnect();
      return interaction.reply('Çıktım.');
    }

    if (cmd === 'play') {
      const query = interaction.options.getString('query', true);
      if (!userVoice) return interaction.reply({ content: 'Çalabilmem için önce bir ses kanalına gir.', ephemeral: true });
      await music.connect(userVoice);
      await music.enqueue(query);
      return interaction.reply(`Kuyruğa eklendi: \`${query}\``);
    }

    if (cmd === 'skip') {
      music.skip();
      return interaction.reply('Geçildi.');
    }

    if (cmd === 'stop') {
      music.clear();
      return interaction.reply('Durdurdum, kuyruk temizlendi.');
    }

    if (cmd === 'now') {
      if (!music.current) return interaction.reply('Şu an bir şey çalmıyor.');
      return interaction.reply(
        `Şu an: \`${music.current.resolved}\`\nKaynak: ${music.current.youtubeUrl}`
      );
    }

    if (cmd === 'queue') {
      const items = music.queue.slice(0, 10).map((x, i) => `${i + 1}. ${x.queryOrUrl}`);
      if (!items.length) return interaction.reply('Kuyruk boş.');
      return interaction.reply(`Kuyruk:\n${items.join('\n')}`);
    }

    return interaction.reply({ content: 'Bilinmeyen komut.', ephemeral: true });
  } catch (e) {
    console.error(e);
    const msg = e?.message ? `Hata: ${e.message}` : 'Hata oluştu.';
    if (interaction.replied || interaction.deferred) {
      return interaction.followUp({ content: msg, ephemeral: true });
    }
    return interaction.reply({ content: msg, ephemeral: true });
  }
});

client.login(cfg.discordToken);
