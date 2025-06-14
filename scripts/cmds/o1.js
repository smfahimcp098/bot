const axios = require("axios");

module.exports = {
  config: {
    name: "o1",
    version: "1.2",
    author: "S M Fahim",
    countDown: 10,
    role: 0,
    longDescription: {
      en: "Generate Ghibli-style images (1–4) in one reply. Supports reply-image, --count/--n, and --ar."
    },
    category: "image",
    guide: {
      en: "{pn} <prompt> [--count N | --n N] [--ar 1:1|2:3|3:2]\n\nExamples:\n• {pn} sunset --count 3 --ar 2:3\n• (reply to image) {pn} make it Ghibli --n 2"
    }
  },

  onStart: async function ({ message, api, args, event }) {
    if (!args.length) return message.reply("⚠️ Please provide a prompt.");

    let count = 1;
    let ratio = "1:1";
    const promptParts = [];

    for (let i = 0; i < args.length; i++) {
      if (["--count", "--n"].includes(args[i]) && args[i + 1]) {
        const num = parseInt(args[++i], 10);
        if (num >= 1 && num <= 4) count = num;
        else return message.reply("⚠️ --count/--n must be 1–4.");
      }
      else if (args[i] === "--ar" && args[i + 1]) {
        const r = args[++i];
        if (["1:1","2:3","3:2"].includes(r)) ratio = r;
        else return message.reply("⚠️ --ar must be 1:1, 2:3 or 3:2.");
      }
      else promptParts.push(args[i]);
    }

    const promptText = promptParts.join(" ");
    const encodedPrompt = encodeURIComponent(promptText);
    let url = `https://smfahim.xyz/gpt1image-ghibli?prompt=${encodedPrompt}&n=${count}&ratio=${ratio}`;

    const replyImg = event.messageReply?.attachments?.[0]?.url;
    if (replyImg) url += `&imageUrl=${encodeURIComponent(replyImg)}`;

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      const res = await axios.get(url);
      const images = res.data.data;

      if (!Array.isArray(images) || images.length === 0) {
        await message.reply("❌ No images returned.");
        return api.setMessageReaction("❌", event.messageID, () => {}, true);
      }

      // Single reply with multiple attachments
      const attachments = await Promise.all(
        images.map(img => global.utils.getStreamFromURL(img.url))
      );

      await message.reply({
        body: `🖼 Prompt: "${promptText}" (${images.length} image${images.length > 1 ? "s" : ""})`,
        attachment: attachments
      });

      api.setMessageReaction("✅", event.messageID, () => {}, true);
    } catch (err) {
      console.error("o1 error:", err);
      await message.reply("❌ Failed to generate image.");
      api.setMessageReaction("❌", event.messageID, () => {}, true);
    }
  }
};
