const axios = require('axios');

module.exports = {
  config: {
    name: 'gen2',
    version: '1.1',
    author: 'Fahim_Noob',
    countDown: 0,
    role: 0,
    longDescription: {
      en: 'Text to Image'
    },
    category: 'image',
    guide: {
      en: '{pn} prompt'
    }
  },

  onStart: async function ({ message, api, args, event }) {
    const promptText = args.join(' ');

    if (!promptText) {
      return message.reply("😡 Please provide a prompt");
    }

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    message.reply("✅| Generating please wait.", async (err, info) => {
      try {
        const o = 'xyz';
        const imageUrls = [];
        const reactions = ["🔴", "🔵", "🟢", "🟡"];

        for (let i = 0; i < 4; i++) {
          const imageURL = `https://smfahim.${o}/creartai?prompt=${encodeURIComponent(promptText)}`;
          imageUrls.push(imageURL);
        }

        const attachments = [];
        for (let i = 0; i < imageUrls.length; i++) {
          const attachment = await global.utils.getStreamFromURL(imageUrls[i]);
          attachments.push(attachment);
          api.setMessageReaction(reactions[i], event.messageID, () => {}, true);
        }

        message.reply({
          attachment: attachments
        });

        api.setMessageReaction("✅", event.messageID, () => {}, true);

        let tempMessageID = info.messageID;
        message.unsend(tempMessageID);
        
      } catch (error) {
        console.error(error);
        message.reply("😔 Something went wrong, please try again later.");
        api.setMessageReaction("❌", event.messageID, () => {}, true);
      }
    });
  }
};
