module.exports = {
  config: {
    name: 'fluxdev',
    version: '1.1',
    author: 'Team Calyx',
    countDown: 10,
    role: 0,
    longDescription: {
      en: 'Generate up to 4 images from text using Flux Dev model.'
    },
    category: 'image',
    guide: {
      en: '{pn} prompt [--ar=<ratio>] or [--ar <ratio>]'
    }
  },

  onStart: async function ({ message, api, args, event }) {
    const promptText = args.join(' ');

    if (!promptText) {
      return message.reply(
        `Please enter a text prompt\nExample: \n${global.GoatBot.config.prefix}fluxdev a cat or,\n${global.GoatBot.config.prefix}fluxdev a girl --ar 2:3`
      );
    }

    let ratio = '1:1';

    const ratioIndex = args.findIndex(arg => arg.startsWith('--ar='));
    if (ratioIndex !== -1) {
      ratio = args[ratioIndex].split('=')[1];
      args.splice(ratioIndex, 1);
    } else {
      const ratioFlagIndex = args.findIndex(arg => arg === '--ar');
      if (ratioFlagIndex !== -1 && args[ratioFlagIndex + 1]) {
        ratio = args[ratioFlagIndex + 1];
        args.splice(ratioFlagIndex, 2);
      }
    }

    api.setMessageReaction('⏳', event.messageID, () => {}, true);

    const startTime = new Date().getTime();

    try {
      const prompt = args.join(' ');
      const params = `flux?prompt=${encodeURIComponent(prompt)}&ratio=${ratio}`;
					const x = "xyz";
      const urls = Array(4).fill(`https://smfahim.${x}/${params}`);

      const results = await Promise.all(
        urls.map(async (url) => {
          try {
            return await global.utils.getStreamFromURL(url);
          } catch {
            return null;
          }
        })
      );

      const attachments = results.filter(result => result !== null);

      if (attachments.length > 0) {
        const endTime = new Date().getTime();
        const timeTaken = (endTime - startTime) / 1000;

        message.reply({
          body: `Here are your Flux Dev Model images 🖼\nTime taken: ${timeTaken} seconds\nImages received: ${attachments.length}`,
          attachment: attachments
        });

        api.setMessageReaction('✅', event.messageID, () => {}, true);
      } else {
        message.reply('❌ No images could be generated.');
        api.setMessageReaction('❌', event.messageID, () => {}, true);
      }
    } catch (error) {
      console.error('Error while generating images:', error);
      api.setMessageReaction('❌', event.messageID, () => {}, true);
    }
  }
};
