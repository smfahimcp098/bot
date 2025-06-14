const axios = require("axios");

module.exports = {
  config: {
    name: "o1",
    version: "1.5",
    author: "Team Calyx",
    countDown: 10,
    role: 0,
    longDescription: {
      en: "Generate Ghibli-style images. Supports reply-image, --count/--n, --ar, and --custom <url>."
    },
    category: "image",
    guide: {
      en: `{pn} <prompt> [--count N | --n N] [--ar ratio] [--custom <image_url>]

Examples:
• {pn} sunset --count 3 --ar 2:3
• {pn} a cute girl --ar 3:2
• {pn} landscape --custom https://example.com/image.jpg`
    }
  },

  onStart: async function ({ message, api, args, event }) {
    if (!args.length) return message.reply("⚠️ Please provide a prompt.");

    let count = 1;
    let ratio = "1:1";
    let customImageUrl = null;
    const promptParts = [];

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if ((arg === "--count" || arg === "--n") && args[i + 1]) {
        const num = parseInt(args[++i]);
        if (num >= 1 && num <= 4) count = num;
        else return message.reply("⚠️ --count/--n must be between 1 and 4.");
      } else if (arg === "--ar" && args[i + 1]) {
        const r = args[++i];
        if (["1:1", "2:3", "3:2"].includes(r)) ratio = r;
        else return message.reply("⚠️ --ar must be 1:1, 2:3 or 3:2.");
      } else if (arg === "--custom") {
        if (!args[i + 1] || args[i + 1].startsWith("--")) {
          return message.reply("⚠️ Please provide a valid image URL after `--custom`.");
        }
        customImageUrl = args[++i];
      } else {
        promptParts.push(arg);
      }
    }

    const promptText = promptParts.join(" ").trim();
    if (!promptText) return message.reply("⚠️ Please provide a valid prompt.");

    let url = `https://smfahim.xyz/gpt1image-ghibli?prompt=${encodeURIComponent(promptText)}&n=${count}&ratio=${ratio}`;

    if (customImageUrl) {
      url += `&imageUrl=${encodeURIComponent(customImageUrl)}`;
    } else if (event.messageReply?.attachments?.[0]?.url) {
      url += `&imageUrl=${encodeURIComponent(event.messageReply.attachments[0].url)}`;
    }

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      const res = await axios.get(url);
      const images = res.data.data;

      if (!Array.isArray(images) || images.length === 0) {
        await message.reply("❌ No image returned from the API.");
        return api.setMessageReaction("❌", event.messageID, () => {}, true);
      }

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
      await message.reply("❌ Failed to generate image. Try again later.");
      api.setMessageReaction("❌", event.messageID, () => {}, true);
    }
  }
};
