# Discord Music Bot (Railway + GitHub)

İstediğin kurallara göre:
- Railway ortam değişkenlerinden (`DISCORD_TOKEN`, id’ler, vb.) çalışır
- Bot “yayın yapıyor” (Streaming) gibi görünür ve **Developed By Cyrus** yazar
- İsteğe bağlı olarak bir ses kanalında “idle” bekler (kulaklık kapalı / mikrofon açık görünümü için `selfDeaf=false`, `selfMute=false`)
- Müzik çalar: komut gelince kullanıcının kanalına gelir ve çalar

## Önemli not (Spotify)
Discord botları Spotify’ın gerçek sesini doğrudan stream edemez (DRM/lisans). Bu bot:
- Spotify **track** linkini alır, şarkı adını + sanatçıyı Spotify API ile çözer (opsiyonel),
- sonra aynı parçayı YouTube’da arayıp YouTube kaynağından çalar.

## Kurulum
1) Discord Developer Portal:
- Bot oluştur, intents: `Guilds`, `GuildVoiceStates` açık olsun
- Token al

2) Ortam değişkenleri:
- Lokal: `.env` oluştur (örnek: `.env.example`)
- Railway: Variables kısmına aynı anahtarları ekle

3) Komutları kaydet:
```bash
node scripts/register-commands.js
```

4) Çalıştır:
```bash
node src/index.js
```

## Railway deploy
- Repo’yu GitHub’a push et
- Railway → New Project → Deploy from GitHub
- Variables’a env’leri ekle
- Start command: `node src/index.js` (package.json `start` var)

## Komutlar
- `/play query-or-url`
- `/skip`
- `/stop`
- `/queue`
- `/join`
- `/leave`
- `/now`

