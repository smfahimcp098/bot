const axios = require("axios");
const { getStreamFromURL } = global.utils;

module.exports = {
  config: {
    name: "art3",
    aliases: [],
    version: "1.1",
    author: "Vincenzo",
    countDown: 15,
    role: 0,
    shortDescription: "Apply Studio Ghibli style filter",
    longDescription: "Transform an image into a Ghibli-style artwork using AI.",
    category: "image",
    guide: {
      en: "{pn} (reply to an image)"
    }
  },

  onStart: async function ({ message, event }) {
    try {
      const isValidImage =
        event.type === "message_reply" &&
        event.messageReply.attachments?.length > 0 &&
        ["photo", "sticker"].includes(event.messageReply.attachments[0].type);

      if (!isValidImage) {
        return message.reply("Please reply to an image or sticker to apply the Ghibli filter.");
      }

      const imageUrl = event.messageReply.attachments[0].url;

      const processingMsg = await message.reply("Applying Ghibli-style filter... Please wait.");

      const apiUrl = `https://www.smfahim.xyz/ghibli-style-net?imageUrl=${encodeURIComponent(imageUrl)}`;
      const res = await axios.get(apiUrl);

      const outputUrl = res.data?.url;
      if (!outputUrl) return message.reply("API did not return an image URL.");

      const stream = await getStreamFromURL(outputUrl);

      await message.reply({
        body: "Here is your Ghibli-style artwork!",
        attachment: stream
      });

      message.reaction("✅", event.messageID);
      message.unsend(processingMsg.messageID);
    } catch (err) {
      console.error(err);
      message.reply("Failed to apply Ghibli-style filter. Please try again later.");
    }
  }
};
