const axios = require('axios');
const fs = require("fs-extra");
const path = require('path');

module.exports = {
  config: {
    name: 'nijiv5.1',
    aliases: [],
    version: '1.1',
    role: 2,
    countDown: 5,
    author: 'Vincenzo',
    category: 'AI',
    guide: { 
      en: 'Use the command followed by your prompt and optionally add parameters for aspect ratio (--ar) and style (--s). For example:\n{pn} cute girl, smiling --ar 1:1 --s 3\n{pn} cute girl, smiling --ar 9:16\n{pn} cute girl, smiling --s 3\n{pn} cute girl, smiling'
    }
  },
  onStart: async ({ event, message, api, args }) => {
    let prompt = '';
    let ratio = '1:1';  // Default ratio
    let style = '';     // Optional style

    // Argument parsing
    args.forEach(arg => {
      if (arg.startsWith('--ar=')) {
        ratio = arg.slice(5);
      } else if (arg.startsWith('--s=')) {
        style = arg.slice(4);
      } else {
        prompt += `${arg} `;
      }
    });

    prompt = prompt.trim();
    const endpoint = `/nijiv51/gen?prompt=${encodeURIComponent(prompt)}${style ? `&style=${style}` : ''}&ratio=${ratio}`;

    try {
      message.reply('Please wait.....⏳', event.messageID);
      
      // Sending request to the API
      const response = await axios.get(`https://vincenzo-jin-xkow.onrender.com${endpoint}`);

      // Process image
      const imageURL = response.data.imageUrl;
      const imagePath = path.join(__dirname, 'tmp', `image_${Date.now()}.jpg`);

      // Download and save image locally
      const writer = fs.createWriteStream(imagePath);
      const imageResponse = await axios({
        url: imageURL,
        method: 'GET',
        responseType: 'stream'
      });
      imageResponse.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      // Send image as reply
      const imageStream = fs.createReadStream(imagePath);
      message.reply({ attachment: imageStream }, () => fs.unlinkSync(imagePath));

    } catch (err) {
      console.error("Error sending request", err);
      message.reply(`❌ Error: ${err.message}`); 
    }
  }
};