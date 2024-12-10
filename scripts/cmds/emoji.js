const axios = require('axios');

module.exports = {
  config: {
    name: "emoji",
    version: 2.0,
    countDown: 5,
    author: "OtinXSandip",
    longDescription: "ai",
    category: "fun",
    guide: {
      en: "{p}{n} <Query>",
    },
  },
  onStart: async function ({ message, usersData, event, api, args }) {
    try {
      const emoji = args.join(" ");
      if (!emoji) {
        return message.reply('provide emoji');
      }
const response = `https://api.vyturex.com/emoji-gif?emoji=${emoji}`;

      const stream = await global.utils.getStreamFromURL(response);

      message.reply({ attachment: stream });
    } catch (error) {
      message.reply("API sucks");
    }
  }
};