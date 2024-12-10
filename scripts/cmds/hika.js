const axios = require("axios");

module.exports = {
  config: {
    name: "malta",
    aliases: ["bot","meta"],
    version: "1.1",
    author: "JARiF@Cock | Modified By NZ R ",
    category: "simsimi-bn",
    cooldown: 0,
    role: 0,
    guide: {
      en: "{p}chat hi\nfor initiating conversation: {p}chat hi"
    }
  },
  nehalovesMetaApiRequest: async function (question) {
    try {
      const response = await axios.get(`https://simsimi.vyturex.com/chat?ques=${encodeURIComponent(question)}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  nehalovesMetaHandleCommand: async function ({ args, message }) {
    try {
      const name = args.join(' ');

      try {
        const result = await this.nehalovesMetaApiRequest(name);
        message.reply(result, (err, info) => {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            messageID: info.messageID,
            author: message.senderID
          });
        });
      } catch (error) {
        console.error(error);
        message.reply('Oops! An error occurred.');
      }
    } catch (error) {
      message.reply('Oops! An error occurred: ' + error.message);
    }
  },
  onStart: function ({ args, message }) {
    return this.nehalovesMetaHandleCommand({ args, message });
  },
  onReply: function ({ args, message }) {
    return this.nehalovesMetaHandleCommand({ args, message });
  }
};