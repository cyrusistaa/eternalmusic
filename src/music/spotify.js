const SpotifyWebApi = require('spotify-web-api-node');

function parseSpotifyTrackId(url) {
  try {
    const u = new URL(url);
    if (u.hostname !== 'open.spotify.com') return null;
    const parts = u.pathname.split('/').filter(Boolean);
    if (parts.length < 2) return null;
    const [type, id] = parts;
    if (type !== 'track') return null;
    return id;
  } catch {
    return null;
  }
}

function createSpotifyResolver({ clientId, clientSecret }) {
  if (!clientId || !clientSecret) return null;

  const spotify = new SpotifyWebApi({ clientId, clientSecret });
  let accessToken = null;
  let tokenExpiresAtMs = 0;

  async function ensureToken() {
    const now = Date.now();
    if (accessToken && now + 30_000 < tokenExpiresAtMs) return;
    const grant = await spotify.clientCredentialsGrant();
    accessToken = grant.body.access_token;
    tokenExpiresAtMs = now + grant.body.expires_in * 1000;
    spotify.setAccessToken(accessToken);
  }

  async function trackUrlToSearchQuery(url) {
    const trackId = parseSpotifyTrackId(url);
    if (!trackId) return null;

    await ensureToken();
    const track = await spotify.getTrack(trackId);
    const name = track.body?.name;
    const artists = (track.body?.artists || []).map((a) => a.name).filter(Boolean);
    if (!name) return null;
    return `${name} ${artists.join(' ')}`.trim();
  }

  return { trackUrlToSearchQuery, parseSpotifyTrackId };
}

module.exports = { createSpotifyResolver, parseSpotifyTrackId };

