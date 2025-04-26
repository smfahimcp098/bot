const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "imagine",
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
      return message.reply("Please provide a prompt. Example: imagine a cat --ar 2:3 --s 4");
    }

    // Default values
    let ratio = '1:1';
    let styleNum = '1';
    const styleMap = {
      '1': 'realistic','2': 'metallic','3': 'pixar','4': 'anime','5': 'pixelated',
      '6': 'ink','7': 'illustration','8': 'flat','9': 'minimalistic','10': 'doodle',
      '11': 'cartoonish','12': 'watercolor','13': 'origami','14': '3d','15': 'vector',
      '16': 'handdrawn','17': 'natgeo'
    };

    // Parse ratio and style
    let i;
    if ((i = args.findIndex(a => a.startsWith('--ar='))) !== -1) {
      ratio = args[i].split('=')[1] || ratio;
      args.splice(i, 1);
    } else if ((i = args.indexOf('--ar')) !== -1 && args[i + 1]) {
      ratio = args[i + 1];
      args.splice(i, 2);
    }

    if ((i = args.findIndex(a => a.startsWith('--s='))) !== -1) {
      styleNum = args[i].split('=')[1] || styleNum;
      args.splice(i, 1);
    } else if ((i = args.indexOf('--s')) !== -1 && args[i + 1]) {
      styleNum = args[i + 1];
      args.splice(i, 2);
    }

    const prompt = args.join(' ').trim();
    if (!prompt) return message.reply("Prompt cannot be empty.");

    const style = styleMap[styleNum] || styleMap['4'];
    const validRatios = ['1:1', '2:3', '3:2', '3:4', '4:3', '9:16', '16:9'];
    if (!validRatios.includes(ratio)) {
      return message.reply(`Invalid ratio. Allowed: ${validRatios.join(', ')}`);
    }

    const apiUrl = `https://smfahim.xyz/text2image?prompt=${encodeURIComponent(prompt)}&ratio=${encodeURIComponent(ratio)}&model=${encodeURIComponent(style)}`;

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      let stream;

      if (global.utils && typeof global.utils.getStreamFromURL === 'function') {
        stream = await global.utils.getStreamFromURL(apiUrl);
        await message.reply({ attachment: stream });
      } else {
        const tmpPath = path.join(__dirname, `imagine_${Date.now()}.jpg`);
        const res = await axios.get(apiUrl, { responseType: 'arraybuffer' });
        fs.writeFileSync(tmpPath, res.data);
        const fileStream = fs.createReadStream(tmpPath);
        
        api.setMessageReaction("✅", event.messageID, () => {}, true);
        
        await message.reply({ attachment: fileStream }, () => {
          fs.unlink(tmpPath, (err) => {
            if (err) console.error('Error deleting temp file:', err);
          });
        });
      }

      
    } catch (err) {
      console.error('Error generating image:', err);
      await message.reply("There was an error generating your image. Please try again later.");
      api.setMessageReaction("❌", event.messageID, () => {}, true);
    }
  }
};
