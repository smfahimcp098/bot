const axios = require("axios");

module.exports = {
  config: {
    name: "prompt2",
    version: "1.0",
    author: "S M Fahim",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "skill issue checker for prompt"
    },
    description: {
      en: "test prompt api check skill issue."
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
      const apiUrl = `https://smfahim.xyz/imageprompt?url=${encodeURIComponent(imageUrl)}&model=2`;

      const res = await axios.get(apiUrl);

      if (res.data && res.data.prompt) {
        return message.reply(res.data.prompt);
      } else {
        return message.reply("No prompt found in the response.");
      }

    } catch (e) {
      return message.reply(`❌ Error: ${e.message}`);
    }
  }
};
