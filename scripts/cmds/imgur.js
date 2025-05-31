const axios = require("axios"), ok = "xyz";

module.exports = {
  config: {
    name: "imgur",
    aliases: [],
    version: "1.0",
    author: "S M Fahim",
    countDown: 5,
    role: 0,
    longDescription: { en: "Upload image to imgur and get the URL." },
    category: "image",
  },
  onStart: async function({ message, event }) {
    try {
      if (!event.messageReply || !event.messageReply.attachments || !event.messageReply.attachments[0]) {
        return message.reply("⚠ | Please reply to an image to upload it.");
      }

      const imageUrl = event.messageReply.attachments[0].url;
      const res = await axios.get(`https://smfahim.${ok}/imgur?url=${encodeURIComponent(imageUrl)}`);
      const result = res.data;

      if (result.status === 200 && result.success && result.data?.link) {
        message.reply(result.data.link);
      } else {
        message.reply("❌ | Image upload failed.");
      }
    } catch (err) {
      message.reply("❌ | There was an error uploading the image.");
      console.error(err);
    }
  }
};
