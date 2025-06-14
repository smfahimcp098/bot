const axios = require("axios");

module.exports = {
  config: {
    name: "o1",
    version: "1.6",
    author: "Team Calyx",
    countDown: 10,
    role: 0,
    longDescription: {
      en: "Generate Ghibli-style images. Supports reply-image, --count/--n, --ar, --custom <url>, and --fahim."
    },
    category: "image",
    guide: {
      en: `{pn} <prompt> [--count N | --n N] [--ar ratio] [--custom <image_url>] [--fahim]

Examples:
• {pn} sunset --count 3 --ar 2:3
• {pn} a cute girl --ar 3:2
• {pn} landscape --custom https://example.com/image.jpg
• {pn} add ghibli style of this image --fahim`
    }
  },

  onStart: async function ({ message, api, args, event }) {
    if (!args.length) return message.reply("⚠️ Please provide a prompt.");

    let count = 1;
    let ratio = "1:1"; // default ratio
    let customImageUrl = null;
    let useFahimImage = false;
    const promptParts = [];

    // Default fahim image URL
    const fahimDefaultUrl = "https://i.ibb.co/LBgLgK7/1747404905394.jpg";

    // Parse arguments
    for (let i = 0; i < args.length; i++) {
      const arg = args[i].toLowerCase();
      if ((arg === "--count" || arg === "--n") && args[i + 1]) {
        const num = parseInt(args[++i]);
        if (num >= 1 && num <= 4) count = num;
        else return message.reply("⚠️ --count/--n must be between 1 and 4.");
      } else if (arg === "--ar" && args[i + 1]) {
        const r = args[++i];
        if (["1:1", "2:3", "3:2"].includes(r)) ratio = r;
        else return message.reply("⚠️ --ar must be one of: 1:1, 2:3, 3:2.");
      } else if (arg === "--custom") {
        if (!args[i + 1] || args[i + 1].startsWith("--")) {
          return message.reply("⚠️ Please provide a valid image URL after `--custom`.");
        }
        customImageUrl = args[++i];
      } else if (arg === "--fahim") {
        useFahimImage = true;
      } else {
        promptParts.push(args[i]);
      }
    }

    const promptText = promptParts.join(" ").trim();
    if (!promptText) return message.reply("⚠️ Please provide a valid prompt.");

    // Map ratio to actual size string for the API
    const ratioToSize = {
      "1:1": "1024x1024",
      "2:3": "1024x1536",
      "3:2": "1536x1024"
    };

    const size = ratioToSize[ratio] || "1024x1024";

    // Construct URL
    let url = `https://smfahim.xyz/gpt1image-ghibli?prompt=${encodeURIComponent(promptText)}&size=${encodeURIComponent(size)}&n=${count}`;

    // Image URL priority: --custom > --fahim > reply-image
    if (customImageUrl) {
      url += `&imageUrl=${encodeURIComponent(customImageUrl)}`;
    } else if (useFahimImage) {
      url += `&imageUrl=${encodeURIComponent(fahimDefaultUrl)}`;
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
