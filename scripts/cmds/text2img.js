const axios = require('axios');
const { Readable } = require('stream');

module.exports = {
  config: {
    name: "text2img",
    version: "1.1",
    author: "S M Fahim",
    role: 0,
    shortDescription: { en: 'Text to Image' },
    category: "ai",
    guide: {
      en: `Usage: {p}{n} <prompt> --ar <ratio> --s <styleNumber>\n
Models:\n1: realistic\n2: metallic\n3: pixar\n4: anime\n5: pixelated\n6: ink\n7: illustration\n8: flat\n9: minimalistic\n10: doodle\n11: cartoonish\n12: watercolor\n13: origami\n14: 3d\n15: vector\n16: handdrawn\n17: natgeo\n
Ratios: 1:1, 2:3, 3:2, 3:4, 4:3, 9:16, 16:9`
    }
  },

  onStart: async function ({ message, api, args, event }) {
    if (!args.length) {
      return message.reply("Please provide a prompt. Example: animagine a cat --ar 2:3 --s 4");
    }

    // Default values
    let ratio = '1:1';
    let styleNum = '1'; // default to anime
    const styleMap = {
      '1': 'realistic','2': 'metallic','3': 'pixar','4': 'anime','5': 'pixelated',
      '6': 'ink','7': 'illustration','8': 'flat','9': 'minimalistic','10': 'doodle',
      '11': 'cartoonish','12': 'watercolor','13': 'origami','14': '3d','15': 'vector',
      '16': 'handdrawn','17': 'natgeo'
    };

    // Parse --ar / --ar= flags
    let i;
    if ((i = args.findIndex(a => a.startsWith('--ar='))) !== -1) {
      ratio = args[i].split('=')[1] || ratio;
      args.splice(i, 1);
    } else if ((i = args.indexOf('--ar')) !== -1 && args[i+1]) {
      ratio = args[i+1];
      args.splice(i, 2);
    }

    // Parse --s / --s= flags
    if ((i = args.findIndex(a => a.startsWith('--s='))) !== -1) {
      styleNum = args[i].split('=')[1] || styleNum;
      args.splice(i, 1);
    } else if ((i = args.indexOf('--s')) !== -1 && args[i+1]) {
      styleNum = args[i+1];
      args.splice(i, 2);
    }

    const prompt = args.join(' ').trim();
    if (!prompt) {
      return message.reply("Prompt cannot be empty.");
    }

    // Validate style and ratio
    const style = styleMap[styleNum] || styleMap['4'];
    const validRatios = ['1:1','2:3','3:2','3:4','4:3','9:16','16:9'];
    if (!validRatios.includes(ratio)) {
      return message.reply(`Invalid ratio. Allowed: ${validRatios.join(', ')}`);
    }

    // Build API URL (model query param for style)
    const apiUrl = `https://smfahim.xyz/wan-ai?prompt=${encodeURIComponent(prompt)}` +
                   `&ratio=${encodeURIComponent(ratio)}` +
                   `&model=${encodeURIComponent(style)}`;

    // Show typing/react
    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      // Fetch image stream
      const res = await axios.get(apiUrl, { responseType: 'stream' });
      const stream = res.data;

      // Reply with image stream attachment
      api.setMessageReaction("✅", event.messageID, () => {}, true);
      await message.reply({ attachment: stream });
      
    } catch (err) {
      console.error('Error generating image:', err);
      await message.reply("There was an error generating your image. Please try again later.");
      api.setMessageReaction("❌", event.messageID, () => {}, true);
    }
  }
};
