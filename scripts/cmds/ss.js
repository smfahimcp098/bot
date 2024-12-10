const axios = require('axios');

module.exports = {
  config: {
    name: 'ss',
    //aliases: ['ss'],
    version: '1.0',
    author: 'Fahim_Noob',
    countDown: 0,
    role: 2,
    longDescription: {
      en: 'Take a screenshot of a website with custom options'
    },
    category: 'utility',
    guide: {
      en: '{pn} <website URL> [--ar <aspect ratio>|--ar=<aspect ratio>] [--d <device>|--d=<device>] [--t <time in seconds>|--t=<time in seconds>]'
    }
  },

  onStart: async function ({ message, api, args, event }) {
    let websiteURL = args.find(arg => !arg.startsWith('--'))?.trim();
    let aspectRatio = args.find(arg => arg.startsWith('--ar'))?.split(/=|\s+/)[1];
    let device = args.find(arg => arg.startsWith('--d'))?.split(/=|\s+/)[1];
    let time = args.find(arg => arg.startsWith('--t'))?.split(/=|\s+/)[1];

    if (!websiteURL) {
      return message.reply("😡 Please provide a website URL to capture a screenshot.");
    }

    if (!/^https?:\/\//i.test(websiteURL)) {
      websiteURL = `https://${websiteURL}`;
    }

    aspectRatio = aspectRatio || '1:1';
    device = device || 'desktop';
    time = time ? parseInt(time) * 1000 : 5000;

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    const startTime = new Date().getTime();

    try {
      const queryParams = new URLSearchParams({
        url: websiteURL,
        device: device,
        ratio: aspectRatio,
        time: time
      });

      const ok = "xyz";

      const screenshotURL = `https://smfahim.${ok}/ss?${queryParams.toString()}`;
      const attachment = await global.utils.getStreamFromURL(screenshotURL);

      const endTime = new Date().getTime();
      const timeTaken = (endTime - startTime) / 1000;

      message.reply({
        body: `Here is the screenshot 📸\nTime taken: ${timeTaken} seconds`,
        attachment: attachment
      });

      api.setMessageReaction("✅", event.messageID, () => {}, true);

    } catch (error) {
      console.error(error);
      message.reply("😔 Something went wrong, please try again.");

      api.setMessageReaction("❌", event.messageID, () => {}, true);
    }
  }
};