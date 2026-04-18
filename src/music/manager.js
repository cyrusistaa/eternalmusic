const {
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  entersState,
  getVoiceConnection,
  joinVoiceChannel,
  VoiceConnectionStatus
} = require('@discordjs/voice');

const { resolveToYouTubeUrl, createAudioStream } = require('./youtube');

class GuildMusicManager {
  constructor({ guildId, spotifyResolver }) {
    this.guildId = guildId;
    this.spotifyResolver = spotifyResolver;
    this.queue = [];
    this.current = null;
    this.player = createAudioPlayer();
    this.player.on(AudioPlayerStatus.Idle, () => {
      this.current = null;
      this._playNext().catch(() => {});
    });
  }

  get connection() {
    return getVoiceConnection(this.guildId);
  }

  async connect(voiceChannel) {
    const existing = this.connection;
    if (existing && existing.joinConfig.channelId === voiceChannel.id) return existing;
    if (existing) existing.destroy();

    const conn = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      selfDeaf: false,
      selfMute: false
    });
    conn.subscribe(this.player);

    conn.on(VoiceConnectionStatus.Disconnected, async () => {
      try {
        await Promise.race([
          entersState(conn, VoiceConnectionStatus.Signalling, 5_000),
          entersState(conn, VoiceConnectionStatus.Connecting, 5_000)
        ]);
      } catch {
        try {
          conn.destroy();
        } catch {}
      }
    });

    await entersState(conn, VoiceConnectionStatus.Ready, 20_000);
    return conn;
  }

  disconnect() {
    const conn = this.connection;
    if (conn) conn.destroy();
  }

  clear() {
    this.queue = [];
    this.current = null;
    this.player.stop(true);
  }

  async enqueue(queryOrUrl) {
    this.queue.push({ queryOrUrl });
    if (!this.current && this.player.state.status === AudioPlayerStatus.Idle) {
      await this._playNext();
    }
  }

  skip() {
    this.player.stop(true);
  }

  async _resolveQuery(queryOrUrl) {
    if (this.spotifyResolver) {
      const q = await this.spotifyResolver.trackUrlToSearchQuery(queryOrUrl);
      if (q) return q;
    }
    return queryOrUrl;
  }

  async _playNext() {
    const next = this.queue.shift();
    if (!next) return;

    const resolved = await this._resolveQuery(next.queryOrUrl);
    const youtubeUrl = await resolveToYouTubeUrl(resolved);

    const { stream, type } = await createAudioStream(youtubeUrl);
    const resource = createAudioResource(stream, { inputType: type });

    this.current = { original: next.queryOrUrl, resolved, youtubeUrl };
    this.player.play(resource);
  }
}

module.exports = { GuildMusicManager };

