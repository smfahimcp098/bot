const axios = require('axios');

module.exports = {
  config: {
    name: "animagine",
    version: "1.1",
    author: "Team Calyx",
    role: 0,
    shortDescription: {
      en: 'Text to Image'
    },
    category: "ai",
    guide: {
      en: `{p}{n} <prompt> --ar <ratio> --s <styleNumber>
    Models:
    1: anime
    2: ghibli1
    3: ghibli2
    4: ghibli3`
    }
  },
  onStart: async function ({ message, api, args, event }) {
    if (!args.length) {
      return message.reply("Usage: animagine <prompt> [--ar=<ratio> | --ar <ratio>] [--s=<styleNumber> | --s <styleNumber>]");
    }

    let ratio = '1:1';
    let styleNum = '1';
    const styleMap = { '1': 'anime', '2': 'ghibli1', '3': 'ghibli2', '4': 'ghibli3' };

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

    const eqStyleIndex = args.findIndex(a => a.startsWith('--s='));
    if (eqStyleIndex !== -1) {
      styleNum = args[eqStyleIndex].split('=')[1] || styleNum;
      args.splice(eqStyleIndex, 1);
    } else {
      const flagStyleIndex = args.findIndex(a => a === '--s');
      if (flagStyleIndex !== -1 && args[flagStyleIndex + 1]) {
        styleNum = args[flagStyleIndex + 1];
        args.splice(flagStyleIndex, 2);
      }
    }

    const prompt = args.join(' ').trim();
    if (!prompt) {
      return message.reply("Please provide a prompt. Example: animagine a cute cat --ar=2:3 --s=1");
    }

    const style = styleMap[styleNum] || styleMap['1'];

    const apiUrl = `https://smfahim.xyz/animagine?prompt=${encodeURIComponent(prompt)}` +
                   `&ratio=${encodeURIComponent(ratio)}` +
                   `&style=${encodeURIComponent(style)}`;

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      const resApi = await axios.get(apiUrl);
      if (!resApi.data || !resApi.data.success || !resApi.data.image) {
        throw new Error('Invalid API response');
      }
      const imageUrl = resApi.data.image;

      const attachment = await global.utils.getStreamFromURL(imageUrl);

      await message.reply({ attachment });
      api.setMessageReaction("✅", event.messageID, () => {}, true);
    } catch (err) {
      console.error('Error generating image:', err);
      await message.reply("There was an error generating your image. Please try again later.");
      api.setMessageReaction("❌", event.messageID, () => {}, true);
    }
  }
};
