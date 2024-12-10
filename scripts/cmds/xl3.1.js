const axios = require('axios');

module.exports = {
  config: {
    name: 'xl3.1',
    version: '1.0',
    role: 0,
    countDown: 5,
    author: "Team Calyx",
    category: 'image',
  },
  onStart: async ({ event, message, args, usersData }) => {
    const { senderID } = event;
    const isAdmin = global.GoatBot.config.adminBot.includes(senderID);
    const limit = 5;
    const today = new Date().toDateString();

    let userData = await usersData.get(senderID);
    if (!userData.data) {
      userData.data = { xlLimit: 0, lastUseDate: today };
    }
    if (userData.data.lastUseDate !== today) {
      userData.data.xlLimit = 0;
      userData.data.lastUseDate = today;
    }
    if (!isAdmin) {
      if (userData.data.xlLimit >= limit) {
        return message.reply("Your image generation limit for today has been reached.");
      }

      userData.data.xlLimit += 1;
      await usersData.set(senderID, userData);
    }

    let prompt = args.join(' ');
    let ratio = "1:1";
    let weight = 0.9;

    if (!prompt) {
      return message.reply("Please provide your prompt first.");
    }

    args.forEach(arg => {
      if (arg.startsWith("--ar=")) {
        ratio = arg.slice(5);
      } else if (arg.startsWith("--weight=")) {
        weight = parseFloat(arg.slice(9));
      }
    });

    const noob = "xyz";

    const endpoint = `/tensor/xl?prompt=${encodeURIComponent(prompt)}&ratio=${ratio}`;

    try {
      await message.reply("✅| Generating please wait.");
      message.reaction('⏳', event.messageID);

      const response = await axios.get(`https://smfahim.${noob}${endpoint}`);

      const imageURL = response.data.imageUrl;

      const remainingUses = isAdmin ? 'Admins enjoy unlimited usage privileges.' : `You have ${limit - userData.data.xlLimit} uses left for today.`;

      message.reply({ 
        body: `📦 Model: XL\n🔍 Detected: ${remainingUses}`, 
        attachment: await utils.getStreamFromURL(imageURL, "image.jpg")
      });
      message.reaction('✅', event.messageID);
    } catch (err) {
      message.reaction('❌', event.messageID);
      message.reply(`❌ Error: ${err.message}`);
    }
  }
};