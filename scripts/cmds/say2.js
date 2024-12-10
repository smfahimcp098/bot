
const axios = require("axios");

module.exports = {
  config: {
    name: "say2",
    version: "1.1",
    author: "JARiF",
    countDown: 0,
    role: 0,
    category: "voice",
    shortDescription: "",
    longDescription: "",
    guide: {
      en: "{pn} [prompt]",
    },
    onReply: async function ({ api, message, event }) {},
  },

  onStart: async function ({ api, args, message, event }) {
    try {
      let p = args.join(' ');

      const b = await axios.get(`https://www.api.vyturex.com/beast?query=${encodeURIComponent(p)}`);

      const f = b.data.audio;

      message.reply({
        body: "Your response message here",
        attachment: await global.utils.getStreamFromURL(f),
      });

      if (this.config.onReply) {
        await this.config.onReply({ api, message, event });
      }

    } catch (error) {
      message.reply("Error" + error);
    }
  },
};
