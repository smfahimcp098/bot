const axios = require("axios");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "glab",
    version: "2.2",
    author: "Vincenzo",
    countDown: 10,
    role: 0,
    shortDescription: {
      en: 'Premium Image Generation'
    },
    longDescription: {
      en: "Generate 4 AI images in grid format and select with U1-U4"
    },
    category: "image",
    guide: {
      en: '{pn} <prompt> | [ratio]\nEx: {pn} cyberpunk city | 1:1\n3:4\n4:3\n9:16\n16:9'
    }
  },

  onStart: async function ({ message, api, args, event }) {
    const text = args.join(' ');
    if (!text) return message.reply("Please provide a prompt");

    const parts = text.split('|').map(part => part.trim());
    const prompt = parts[0];
    const ratio = parts[1] || '1:1';

    const validRatios = ['1:1', '4:3', '3:4', '16:9', '9:16'];
    if (!validRatios.includes(ratio)) {
      return message.reply(`Invalid ratio. Valid options: ${validRatios.join(', ')}`);
    }

    const baseURL = `https://glab.onrender.com/glab?prompt=${encodeURIComponent(prompt)}&ratio=${ratio}`;
    const tmpDir = os.tmpdir();
    const startTime = Date.now();

    try {
      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      const processingMsg = await message.reply(`🔄 Generating ${ratio} images...`);
      const processingMsgID = processingMsg.messageID;

      const res = await axios.get(baseURL);
      const images = res.data.result;

      if (!images || images.length === 0) {
        await api.unsendMessage(processingMsgID);
        return message.reply("❌ No images generated. Please try another prompt.");
      }

      const imagePaths = [];
      for (let i = 0; i < Math.min(4, images.length); i++) {
        try {
          const base64Data = images[i].encodedImage.split(',')[1];
          const buffer = Buffer.from(base64Data, 'base64');
          const filename = `glab_${i}_${Date.now()}.jpg`;
          const filePath = path.join(tmpDir, filename);
          fs.writeFileSync(filePath, buffer);
          imagePaths.push(filePath);
        } catch (e) {
          console.error(`Error saving image ${i}:`, e);
        }
      }

      if (imagePaths.length === 0) {
        await api.unsendMessage(processingMsgID);
        return message.reply("❌ Failed to save any images.");
      }

      const loadedImages = await Promise.all(imagePaths.map(p => loadImage(p)));
      const imgWidth = loadedImages[0].width;
      const imgHeight = loadedImages[0].height;

      const canvas = createCanvas(imgWidth * 2, imgHeight * 2);
      const ctx = canvas.getContext('2d');

      ctx.drawImage(loadedImages[0], 0, 0, imgWidth, imgHeight);
      ctx.drawImage(loadedImages[1], imgWidth, 0, imgWidth, imgHeight);
      ctx.drawImage(loadedImages[2], 0, imgHeight, imgWidth, imgHeight);
      ctx.drawImage(loadedImages[3], imgWidth, imgHeight, imgWidth, imgHeight);

      const combinedPath = path.join(tmpDir, `glab_combined_${Date.now()}.jpg`);
      const out = fs.createWriteStream(combinedPath);
      const stream = canvas.createJPEGStream({ quality: 0.95 });
      stream.pipe(out);

      await new Promise((resolve) => out.on('finish', resolve));

      const endTime = Date.now();
      const generationTime = ((endTime - startTime)/1000).toFixed(1);

      await api.unsendMessage(processingMsgID);

      const sentMsg = await message.reply({
        body: `U1, U2, U3, U4\nTime: ${generationTime}s`,
        attachment: fs.createReadStream(combinedPath)
      });

      global.GoatBot.onReply.set(sentMsg.messageID, {
        commandName: this.config.name,
        messageID: sentMsg.messageID,
        imagePaths,
        combinedPath,
        author: event.senderID
      });

    } catch (error) {
      console.error("Error:", error);
      message.reply("❌ Image generation failed. Please try again later.");
    } finally {
      api.setMessageReaction("✅", event.messageID, () => {}, true);
    }
  },

  onReply: async function ({ event, api, Reply, message }) {
    const { author, imagePaths, combinedPath, messageID } = Reply;
    if (event.senderID !== author) return;

    const selection = event.body.toLowerCase();
    const validSelections = ['u1', 'u2', 'u3', 'u4'];

    if (validSelections.includes(selection)) {
      const index = parseInt(selection.charAt(1)) - 1;
      try {
        await message.reply({
          attachment: fs.createReadStream(imagePaths[index])
        });
      } catch (e) {
        message.reply("❌ Failed to send selected image.");
      }
    } else {
      message.reply("⚠️ Please reply with U1, U2, U3 or U4 to select an image.");
    }

    global.GoatBot.onReply.delete(messageID);
    try {
      imagePaths.forEach(p => fs.unlinkSync(p));
      fs.unlinkSync(combinedPath);
    } catch (e) {
      console.error("Cleanup error:", e);
    }
  }
};
