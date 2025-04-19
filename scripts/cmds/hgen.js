const axios = require('axios');

module.exports = {
  config: {
    name: "hgen",
    version: "1.3",
    author: "Team Calyx",
    role: 0,
    shortDescription: {
      en: 'Text to Image'
    },
    category: "ai",
    guide: {
      en: `{p}{n} <prompt> --ar <ratio>
Example: animagine a cute cat --ar 2:3`
    }
  },

  onStart: async function ({ message, api, args, event }) {
    if (!args.length) {
      return message.reply("Usage: animagine <prompt> [--ar <ratio>]");
    }

    // parse --ar flag
    let ratio = '1:1';
    const eqArIndex = args.findIndex(a => a.startsWith('--ar='));
    if (eqArIndex !== -1) {
      ratio = args[eqArIndex].split('=')[1] || ratio;
      args.splice(eqArIndex, 1);
    } else {
      const flagArIndex = args.findIndex(a => a === '--ar');
      if (flagArIndex !== -1 && args[flagArIndex + 1]) {
        ratio = args[flagArIndex + 1];
        args.splice(flagArIndex, 2);
      }
    }

    const prompt = args.join(' ').trim();
    if (!prompt) {
      return message.reply("Please provide a prompt. Example: animagine a cute cat --ar 2:3");
    }

    const apiUrl = `https://www.smfahim.xyz/hgen?prompt=${encodeURIComponent(prompt)}&ratio=${encodeURIComponent(ratio)}`;

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      const resApi = await axios.get(apiUrl);
      if (!resApi.data || !resApi.data.success || !resApi.data.data) {
        throw new Error('Invalid API response');
      }

      const { task_id, status, url, width, height } = resApi.data.data;
      const attachment = await global.utils.getStreamFromURL(url);

      await message.reply({
        body: `📋 Task ID: ${task_id}\n🎯 Status: ${status}\n🖼️ Resolution: ${width}x${height}`,
        attachment
      });

      api.setMessageReaction("✅", event.messageID, () => {}, true);

    } catch (err) {
      console.error('Error generating image:', err);
      await message.reply("There was an error generating your image. Please try again later.");
      api.setMessageReaction("❌", event.messageID, () => {}, true);
    }
  }
};
