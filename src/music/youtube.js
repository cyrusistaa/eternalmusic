const playdl = require('play-dl');

async function resolveToYouTubeUrl(queryOrUrl) {
  if (playdl.yt_validate(queryOrUrl) === 'video') return queryOrUrl;

  const results = await playdl.search(queryOrUrl, { limit: 1 });
  const first = results?.[0];
  if (!first?.url) throw new Error('YouTube sonucu bulunamadı.');
  return first.url;
}

async function createAudioStream(youtubeUrl) {
  const stream = await playdl.stream(youtubeUrl, { quality: 2 });
  return { stream: stream.stream, type: stream.type };
}

module.exports = { resolveToYouTubeUrl, createAudioStream };

