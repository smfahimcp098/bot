const axios = require("axios");
const tinyurl = require("tinyurl");

module.exports = {
  config: {
    name: "art",
    role: 0,
    author: "S M Fahim",
    countDown: 5,
    longDescription: "Art images",
    category: "image",
    guide: {
      en: "${pn} reply to an image with a prompt and choose model 1 - 10"
    }
  },

  onStart: async function ({ message, api, args, event }) {
    const text = args.join(' ');

    if (!event.messageReply || !event.messageReply.attachments || !event.messageReply.attachments[0]) {
      return message.reply("⚠️ Please reply to an image.");
    }

    const imgurl = encodeURIComponent(event.messageReply.attachments[0].url);
    const [model] = text.split('|').map((t) => t.trim());
    const puti = model || "6";

    const glamURL = `https://smfahim.xyz/art/glamai?url=${imgurl}&filter=${puti}`;
    api.setMessageReaction("⏰", event.messageID, () => {}, true);

    try {
      message.reply("✅ Generating image, please wait...", async (err, info) => {
        // Call Glam API to get final media_urls
        const { data } = await axios.get(glamURL);
        if (!data.media_urls || !data.media_urls[0]) {
          return message.reply("❌ Failed to get image.");
        }

        const finalImage = data.media_urls[0];
        const shortUrl = await tinyurl.shorten(finalImage);
        const imageStream = await global.utils.getStreamFromURL(finalImage);

        const msg = {
          body: shortUrl,
          attachment: imageStream
        };

        const replyMsg = await message.reply(msg);
        message.unsend(info.messageID);
        api.setMessageReaction("✅", event.messageID, () => {}, true);
      });
    } catch (err) {
      console.error(err);
      message.reply("❌ Error generating art. Try again.");
      api.setMessageReaction("❌", event.messageID, () => {}, true);
    }
  }
};
