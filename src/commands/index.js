const { SlashCommandBuilder } = require('discord.js');

const commands = [
  {
    name: 'play',
    data: new SlashCommandBuilder()
      .setName('play')
      .setDescription('Müzik çal / kuyruğa ekle (Spotify linki veya arama).')
      .addStringOption((o) =>
        o.setName('query').setDescription('Arama veya URL').setRequired(true)
      )
  },
  {
    name: 'skip',
    data: new SlashCommandBuilder().setName('skip').setDescription('Mevcut parçayı geç.')
  },
  {
    name: 'stop',
    data: new SlashCommandBuilder()
      .setName('stop')
      .setDescription('Çalmayı durdur ve kuyruğu temizle.')
  },
  {
    name: 'queue',
    data: new SlashCommandBuilder()
      .setName('queue')
      .setDescription('Kuyruktaki parçaları göster.')
  },
  {
    name: 'join',
    data: new SlashCommandBuilder()
      .setName('join')
      .setDescription('Ses kanalına katıl (kullanıcının kanalına).')
  },
  {
    name: 'leave',
    data: new SlashCommandBuilder()
      .setName('leave')
      .setDescription('Ses kanalından çık.')
  },
  {
    name: 'now',
    data: new SlashCommandBuilder().setName('now').setDescription('Şu an çalan parça.')
  }
];

module.exports = { commands };

