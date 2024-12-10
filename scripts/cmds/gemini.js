const axios = require('axios');
const ok = "xyz";

module.exports = {
  config: {
    name: "gemini",
    version: 1.1,
    author: "Fahim_Noob",
    description: "ai",
    role: 0,
    category: "ai",
    guide: {
      en: "{p}{n} <Query>",
    },
  },
  onStart: async function ({ message, event, api, args }) {
    try {
      if (event.type === "message_reply" && event.messageReply.attachments && event.messageReply.attachments[0].type === "photo") {
        const photoUrl = encodeURIComponent(event.messageReply.attachments[0].url);
        const segs = args.join(" ");
        const url = `https://smfahim.${ok}/gemini?prompt=${encodeURIComponent(segs)}&url=${photoUrl}`;
        const response = await axios.get(url);

        message.reply(response.data.result);
        return;
      }

      const prompt = args.join(" ");
      const encodedPrompt = encodeURIComponent(prompt);
      const res = await axios.get(`https://smfahim.${ok}/gemini?ask=${encodedPrompt}`);
      const result = res.data.result;

      message.reply({
        body: `${result}`,
      }, (info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          messageID: info.messageID,
          author: event.senderID
        });
      });
    } catch (error) {
      console.error("Error:", error.message);
    }
  },
  onReply: async function ({ message, event, args }) {
    try {
      const prompt = args.join(" ");
      const encodedPrompt = encodeURIComponent(prompt);
      const res = await axios.get(`https://smfahim.${ok}/gemini?ask=${encodedPrompt}`);
      const result = res.data.result;

      message.reply({
        body: `${result}`,
      }, (info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          messageID: info.messageID,
          author: event.senderID
        });
      });
    } catch (error) {
      console.error("Error:", error.message);
    }
  }
};