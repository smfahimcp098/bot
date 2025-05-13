const axios = require("axios");

module.exports = {
  config: {
    name: "art",
    role: 0,
    author: "S M Fahim",
    countDown: 5,
    longDescription: "Art image",
    category: "image",
    guide: {
      en: "${pn} reply to an image"
    }
  },

  onStart: async function ({ message, api, event }) {
    if (!event.messageReply || !event.messageReply.attachments || !event.messageReply.attachments[0]) {
      return message.reply("⚠️ Please reply to an image.");
    }

    const originalUrl = event.messageReply.attachments[0].url;
    const encodedOriginal = encodeURIComponent(originalUrl);

    api.setMessageReaction("⏳", event.messageID, () => {}, true);
    const waitMsg = await message.reply("✅ Uploading image, please wait...");

    try {
      const uploadRes = await axios.get(
        `https://www.smfahim.xyz/imgbb?url=${encodedOriginal}`
      );
      const uploaded = uploadRes.data?.image?.url;
      if (!uploaded) throw new Error("Upload failed");

      const artUrl = `https://www.smfahim.xyz/art/glamai?url=${encodeURIComponent(uploaded)}`;
      const artRes = await axios.get(artUrl, { responseType: 'stream' });
      const imageStream = artRes.data;

      await message.reply({
        body: "🖼️ Here is your art.",
        attachment: imageStream
      });
      api.setMessageReaction("✅", event.messageID, () => {}, true);

    } catch (err) {
      console.error(err);
      await message.reply("❌ Something went wrong. Please try again.");
      api.setMessageReaction("❌", event.messageID, () => {}, true);
    } finally {
      message.unsend(waitMsg.messageID);
    }
  }
};
