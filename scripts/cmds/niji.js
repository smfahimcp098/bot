module.exports = {
  config: {
    name: 'niji',
    version: '1.0',
    author: 'Team Calyx',
    countDown: 10,
    role: 0,
    longDescription: {
      en: 'Generate an image from text using SDXL.'
    },
    category: 'image',
    guide: {
      en: '{pn} prompt [--ar=<ratio>]'
    }
  },

  onStart: async function ({ message, api, args, event }) {
    const promptText = args.join(' ');

    if (!promptText) {
      return message.reply(`😖 Please enter a text prompt\n\nExample: \n${global.GoatBot.config.prefix}niji a girl or,\n${global.GoatBot.config.prefix}niji a girl --ar=2:3`);
    }

    let ratio = '1:1';

    const ratioIndex = args.findIndex(arg => arg.startsWith('--ar='));
    if (ratioIndex !== -1) {
      ratio = args[ratioIndex].split('=')[1];
      args.splice(ratioIndex, 1);
    }

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    const startTime = new Date().getTime();

    try {
      const prompt = args.join(' ');
      const world = `&ratio=${ratio}`;
      
      const team = `niji?prompt=${encodeURIComponent(prompt)}${world}`;
      const imageURL = `https://team-calyx.onrender.com/${team}`;
      const attachment = await global.utils.getStreamFromURL(imageURL);

      const endTime = new Date().getTime();
      const timeTaken = (endTime - startTime) / 1000;

      message.reply({
        body: `Here is your Niji Model 🖼\nTime taken: ${timeTaken} seconds`,
        attachment: attachment
      });

      api.setMessageReaction("✅", event.messageID, () => {}, true);

    } catch (error) {
      console.error(error);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
    }
  }
};