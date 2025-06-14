const axios = require("axios");

module.exports = {
  config: {
    name: "o1",
    aliases: [],
    version: "1.1",
    author: "Team Calyx & Fahim",
    countDown: 10,
    role: 0,
    longDescription: {
      en: "Generate a Ghibli-style image. Use `--ar 2:3` for ratio. If you reply to an image, it will use that image."
    },
    category: "image",
    guide: {
      en: "{pn} <prompt>\n\n• Optional: Add `--ar 2:3` or `--ar 3:2`\n• Reply to an image to style it with prompt."
    }
  },

  onStart: async function ({ message, api, args, event }) {
    if (!args.length) {
      return message.reply(
        `⚠️ Please provide a text prompt.\n\nExample:\n${global.GoatBot.config.prefix}o1 a cat\n\nOr reply to an image with:\n${global.GoatBot.config.prefix}o1 describe this scene`
      );
    }

    // Handle --ar (aspect ratio)
    let ratio = "1:1"; // default
    const arIndex = args.findIndex(arg => arg === "--ar");
    if (arIndex !== -1 && args[arIndex + 1]) {
      const inputRatio = args[arIndex + 1];
      if (["1:1", "2:3", "3:2"].includes(inputRatio)) {
        ratio = inputRatio;
        args.splice(arIndex, 2); // remove --ar and value from args
      } else {
        return message.reply("⚠️ Allowed aspect ratios: 1:1, 2:3, 3:2");
      }
    }

    const promptText = args.join(" ").trim();
    const encodedPrompt = encodeURIComponent(promptText);
    let apiUrl = "";

    if (
      event.messageReply &&
      event.messageReply.attachments &&
      event.messageReply.attachments[0] &&
      event.messageReply.attachments[0].url
    ) {
      const rawImgUrl = event.messageReply.attachments[0].url;
      const encodedImg = encodeURIComponent(rawImgUrl);
      apiUrl = `https://smfahim.xyz/gpt1image-ghibli?prompt=${encodedPrompt}&imageUrl=${encodedImg}&ratio=${ratio}&count=1`;
    } else {
      apiUrl = `https://smfahim.xyz/gpt1image-ghibli?prompt=${encodedPrompt}&size=${ratio}&n=1&enhance=false&format=b64_json&count=1`;
    }

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      const res = await axios.get(apiUrl);
      const data = res.data;

      if (Array.isArray(data) && data[0] && (data[0].url || data[0].b64_json)) {
        const imageUrl = data[0].url || `data:image/png;base64,${data[0].b64_json}`;
        const imageStream = await global.utils.getStreamFromURL(imageUrl);

        message.reply("✅ Generation complete. Sending image...", async (err, info) => {
          await message.reply({
            body: `🖼 Prompt: "${promptText}"`,
            attachment: imageStream
          });
          message.unsend(info.messageID);
        });

        api.setMessageReaction("✅", event.messageID, () => {}, true);
      } else {
        await message.reply("❌ Failed to receive image data from API.");
        api.setMessageReaction("❌", event.messageID, () => {}, true);
      }
    } catch (err) {
      console.error("o1 Command Error:", err.message);
      await message.reply("❌ An error occurred while generating the image.");
      api.setMessageReaction("❌", event.messageID, () => {}, true);
    }
  }
};
