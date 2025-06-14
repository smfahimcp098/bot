const axios = require("axios");

module.exports = {
  config: {
    name: "o1",
    aliases: [],
    version: "1.1",
    author: "Team Calyx",
    countDown: 10,
    role: 0,
    longDescription: {
      en: "Generate a Ghibli-style image. Supports image reply and optional parameters like --count/n and --ar."
    },
    category: "image",
    guide: {
      en: "{pn} <prompt>\n\n• Reply to an image for custom input.\n• Add --count or --n (1-4) to get multiple images.\n• Add --ar 2:3 or 3:2 to change aspect ratio.\n\nExamples:\n- {pn} a cat\n- {pn} a cat --count 3 --ar 2:3\n- (reply to image) {pn} make it ghibli style --n 2"
    }
  },

  onStart: async function ({ message, api, args, event }) {
    if (!args[0]) return message.reply(`⚠️ Please provide a prompt.`);

    // Extract --count or --n and --ar from args
    let count = 1;
    let ratio = "1:1";

    const promptParts = [];
    for (let i = 0; i < args.length; i++) {
      if (["--count", "--n"].includes(args[i]) && args[i + 1]) {
        const parsed = parseInt(args[i + 1]);
        if (parsed >= 1 && parsed <= 4) count = parsed;
        i++;
      } else if (args[i] === "--ar" && args[i + 1]) {
        ratio = args[i + 1];
        i++;
      } else {
        promptParts.push(args[i]);
      }
    }

    const promptText = promptParts.join(" ");
    const encodedPrompt = encodeURIComponent(promptText);
    let apiUrl = `https://smfahim.xyz/gpt1image-ghibli?prompt=${encodedPrompt}&n=${count}&ratio=${ratio}`;

    // Check if replying to a message with an image
    if (
      event.messageReply &&
      event.messageReply.attachments &&
      event.messageReply.attachments[0] &&
      event.messageReply.attachments[0].url
    ) {
      const imgUrl = encodeURIComponent(event.messageReply.attachments[0].url);
      apiUrl += `&imageUrl=${imgUrl}`;
    }

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      const res = await axios.get(apiUrl);
      const data = res.data;

      if (Array.isArray(data.data) && data.data.length > 0) {
        for (const img of data.data) {
          const stream = await global.utils.getStreamFromURL(img.url);
          await message.reply({
            body: `🖼 Prompt: "${promptText}"`,
            attachment: stream
          });
        }
        api.setMessageReaction("✅", event.messageID, () => {}, true);
      } else {
        await message.reply("❌ No images returned from API.");
        api.setMessageReaction("❌", event.messageID, () => {}, true);
      }
    } catch (err) {
      console.error("o1 command error:", err);
      await message.reply("❌ Failed to generate image.");
      api.setMessageReaction("❌", event.messageID, () => {}, true);
    }
  }
};
