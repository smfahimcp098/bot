const axios = require("axios");

module.exports = {
  config: {
    name: "art2",
    role: 0,
    author: "S M Fahim",
    countDown: 5,
    longDescription: "Art images",
    category: "image",
    guide: {
      en: "{pn} reply to an image to generate art"
    }
  },

  onStart: async function ({ message, api, args, event }) {
    if (
      !event.messageReply ||
      !event.messageReply.attachments ||
      !event.messageReply.attachments[0]
    ) {
      return message.reply("❗️ Please reply to an image.");
    }

    const originalUrl = event.messageReply.attachments[0].url;
    const encodedImageUrl = encodeURIComponent(originalUrl);

    // Show "processing" reaction
    api.setMessageReaction("⏰", event.messageID, () => {}, true);

    let waitMsg;
    try {
      waitMsg = await message.reply("✅ | Generating art, please wait...");

      // 1) Upload
      const { data: uploadRes } = await axios.get(
        `https://www.smfahim.xyz/art/upload?url=${encodedImageUrl}`
      );
      const uploadUrl = uploadRes.uploadUrl;

      // 2) Init
      const { data: initRes } = await axios.get(
        `https://www.smfahim.xyz/art/cookie-getter`
      );
      const { token, cookies } = initRes;

      // 3) Process
      const { data: processRes } = await axios.get(
        `https://www.smfahim.xyz/art/process?url=${encodeURIComponent(
          uploadUrl
        )}&token=${token}&cookies=${encodeURIComponent(cookies)}`
      );
      const finalImageUrl = processRes.data.image;

      // 4) Upscale (optional)
      const { data: upscaleRes } = await axios.get(
        `https://www.smfahim.xyz/4k?url=${encodeURIComponent(finalImageUrl)}`
      );
      const upscaleUrl = upscaleRes.image;

      // Send the upscaled image
      const attachment = await global.utils.getStreamFromURL(upscaleUrl);
      await message.reply({
        body: "Here is your upscaled art:",
        attachment
      });
    } catch (error) {
      console.error("Art generation error:", error);
      await message.reply("❌ | Failed to generate art. Please try again later.");
    } finally {
      // remove waiting message & set final reaction
      if (waitMsg) {
        await api.unsendMessage(waitMsg.messageID);
      }
      api.setMessageReaction("✅", event.messageID, () => {}, true);
    }
  }
};
