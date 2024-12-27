const axios = require('axios');

module.exports = {
  config: {
    name: 'flux2',
    version: '1.0',
    author: 'Team Calyx',
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

    if (!promptText) return message.reply("😡 Please provide a prompt");

    const startTime = Date.now();

    message.reply("✅ | Generating, please wait...", async () => {
      try {
        const o = 'xyz';
        const imageUrls = Array.from({ length: 4 }, () => `https://smfahim.${o}/flux2?prompt=${encodeURIComponent(promptText)}`);
        const attachments = await Promise.all(imageUrls.map(url => global.utils.getStreamFromURL(url)));

        const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);

        message.reply({
          body: `✅ | Image generated successfully!\n⏱️ | Time taken: ${timeTaken} seconds.`,
          attachment: attachments
        });

      } catch (error) {
        console.error(error);
        message.reply("😔 Something went wrong, please try again later.");
      }
    });
  }
};
