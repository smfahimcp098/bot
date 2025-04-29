const axios = require("axios");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "glab",
    version: "2.4",
    author: "Vincenzo",
    countDown: 10,
    role: 0,
    shortDescription: { en: 'Premium Image Generation' },
    longDescription: { en: "Generate 4 AI images in grid format and select with U1-U4" },
    category: "image",
    guide: { en: '{pn} <prompt> | [ratio]\nEx: {pn} cyberpunk city | 1:1\n3:4\n4:3\n9:16\n16:9' }
  },

  onStart: async function ({ message, api, args, event }) {
    const text = args.join(' ');
    if (!text) return message.reply("Please provide a prompt");

    const [promptPart, ratioPart] = text.split('--ar').map(p => p.trim());
    const prompt = promptPart;
    const ratio = ratioPart || '1:1';

    const validRatios = ['1:1','4:3','3:4','16:9','9:16'];
    if (!validRatios.includes(ratio)) {
      return message.reply(`Invalid ratio. Valid options: ${validRatios.join(', ')}`);
    }

    const baseURL = `https://smfahim.xyz/glab?prompt=${encodeURIComponent(prompt)}&ratio=${ratio}`;
    const tmpDir = os.tmpdir();
    const t0 = Date.now();

    try {
      api.setMessageReaction("⏳", event.messageID, () => {}, true);
      const procMsg = await message.reply(`🔄 Generating images (${ratio})...`);
      const procID = procMsg.messageID;

      const res = await axios.get(baseURL);
      const images = res.data.result || [];

      if (images.length === 0) {
        await api.unsendMessage(procID);
        return message.reply("❌ No images generated. Try another prompt.");
      }

      // Save up to 4 images
      const imagePaths = images.slice(0,4).map((img, i) => {
        const b64 = img.encodedImage.split(',')[1];
        const buf = Buffer.from(b64, 'base64');
        const filename = `glab_${i}_${Date.now()}.jpg`;
        const filePath = path.join(tmpDir, filename);
        fs.writeFileSync(filePath, buf);
        return filePath;
      });

      // Composite into one canvas
      const loaded = await Promise.all(imagePaths.map(p => loadImage(p)));
      const w = loaded[0].width, h = loaded[0].height;
      const canvas = createCanvas(w*2, h*2);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(loaded[0], 0, 0, w, h);
      ctx.drawImage(loaded[1], w, 0, w, h);
      ctx.drawImage(loaded[2], 0, h, w, h);
      ctx.drawImage(loaded[3], w, h, w, h);

      const combinedPath = path.join(tmpDir, `glab_combined_${Date.now()}.jpg`);
      fs.writeFileSync(combinedPath, canvas.toBuffer('image/jpeg', { quality: 0.95 }));

      const t1 = Date.now();
      const timeSec = ((t1 - t0)/1000).toFixed(1);

      await api.unsendMessage(procID);
      const sent = await message.reply({
        body: `Reply with U1, U2, U3 or U4 to select an image.\nTime: ${timeSec}s`,
        attachment: fs.createReadStream(combinedPath)
      });

      // register for onReply
      global.GoatBot.onReply.set(sent.messageID, {
        commandName: this.config.name,
        messageID: sent.messageID,
        author: event.senderID,
        imagePaths
      });

    } catch (e) {
      console.error("Error in onStart:", e);
      await message.reply("❌ Image generation failed. Please try again later.");
    } finally {
      api.setMessageReaction("✅", event.messageID, () => {}, true);
    }
  },

  onReply: async function ({ event, api, Reply }) {
    const { author, imagePaths, messageID, commandName } = Reply;
    // ensure only the original user can reply
    if (event.senderID !== author) return;

    // Check the commandName to avoid misfires
    if (commandName !== this.config.name) return;

    const sel = event.body.trim().toLowerCase();
    const valid = ['u1','u2','u3','u4'];
    if (!valid.includes(sel)) {
      return api.sendMessage("⚠️ Please reply with U1, U2, U3 or U4.", event.threadID, event.messageID);
    }

    const idx = parseInt(sel.charAt(1), 10) - 1;
    if (imagePaths[idx]) {
      await api.sendMessage({ attachment: fs.createReadStream(imagePaths[idx]) }, event.threadID, event.messageID);
    } else {
      await api.sendMessage("❌ Selected image not available.", event.threadID, event.messageID);
    }

    // clear mapping—files are not deleted, so you can U1 then U2 etc.
    global.GoatBot.onReply.delete(messageID);
  }
};
