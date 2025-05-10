const axios = require("axios");

module.exports = {
  config: {
    name: "prompt3",
    version: "1.0",
    author: "S M Fahim",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Skill issue checker for prompt"
    },
    description: {
      en: "Test prompt API check skill issue."
    },
    category: "ai",
    guide: {
      en: "Reply to an image and use the command"
    }
  },

  onStart: async function ({ message, event }) {
    try {
      if (!event.messageReply || !event.messageReply.attachments || event.messageReply.attachments.length === 0) {
        return message.reply("Please reply to an image.");
      }

      const imageUrl = event.messageReply.attachments[0].url;
      const apiUrl = `https://smfahim.xyz/tensor/prompt?url=${encodeURIComponent(imageUrl)}`;

      const res = await axios.post(apiUrl);

      if (res.data && res.data.result) {
        return message.reply(res.data.result);
      } else {
        return message.reply("No result found in the response.");
      }

    } catch (e) {
      return message.reply(`❌ Error: ${e.message}`);
    }
  }
};
