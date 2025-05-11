const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

// Map of styles
const styleMap = {
  "1": "masterpiece, best quality, very aesthetic, absurdres, cinematic still, emotional, harmonious, vignette, highly detailed, high budget, bokeh, cinemascope, moody, epic, gorgeous, film grain, grainy",
  "2": "masterpiece, best quality, very aesthetic, absurdres, cinematic photo, 35mm photograph, film, bokeh, professional, 4k, highly detailed",
  "3": "masterpiece, best quality, very aesthetic, absurdres, anime artwork, anime style, key visual, vibrant, studio anime, highly detailed",
  "4": "masterpiece, best quality, very aesthetic, absurdres, manga style, vibrant, high-energy, detailed, iconic, Japanese comic style",
  "5": "masterpiece, best quality, very aesthetic, absurdres, concept art, digital artwork, illustrative, painterly, matte painting, highly detailed",
  "6": "masterpiece, best quality, very aesthetic, absurdres, pixel-art, low-res, blocky, pixel art style, 8-bit graphics",
  "7": "masterpiece, best quality, very aesthetic, absurdres, ethereal fantasy concept art, magnificent, celestial, ethereal, painterly, epic, majestic, magical, fantasy art, cover art, dreamy",
  "8": "masterpiece, best quality, very aesthetic, absurdres, neonpunk style, cyberpunk, vaporwave, neon, vibes, vibrant, stunningly beautiful, crisp, detailed, sleek, ultramodern, magenta highlights, dark purple shadows, high contrast, cinematic, ultra detailed, intricate, professional",
  "9": "masterpiece, best quality, very aesthetic, absurdres, professional 3d model, octane render, highly detailed, volumetric, dramatic lighting"
};

module.exports = {
  config: {
    name: "fastgen",
    aliases: [],
    version: "1.4",
    author: "S M Fahim",
    countDown: 15,
    role: 0,
    shortDescription: "Generate AI images",
    longDescription: "Generate images using AI with support for aspect ratio, style, and a collage preview.",
    category: "ai",
    guide: "{pn} [description] --ar 2:3 --style 1"
  },

  onStart: async function({ message, args, event, api }) {
    try {
      let prompt = "";
      let ratio = "1:1";
      let style = "";

      for (let i = 0; i < args.length; i++) {
        if (args[i].startsWith("--ar=") || args[i].startsWith("--ratio=")) {
          ratio = args[i].split("=")[1];
        } else if ((args[i] === "--ar" || args[i] === "--ratio") && args[i + 1]) {
          ratio = args[i + 1];
          i++;
        } else if (args[i].startsWith("--s=") || args[i].startsWith("--style=")) {
          style = args[i].split("=")[1];
        } else if ((args[i] === "--s" || args[i] === "--style") && args[i + 1]) {
          style = args[i + 1];
          i++;
        } else {
          prompt += args[i] + " ";
        }
      }

      prompt = prompt.trim();
      if (!prompt) return message.reply("❌ You forgot to enter an image description.");

      // Combine prompt with style keywords
      const styledPrompt = `${prompt}${styleMap[style] ? ", " + styleMap[style] : ""}`.trim();

      const imageLinks = [];

      // Generate up to 4 images
      for (let i = 0; i < 4; i++) {
        const url = `https://www.ai4chat.co/api/image/generate?prompt=${encodeURIComponent(styledPrompt)}&aspect_ratio=${encodeURIComponent(ratio)}`;
        const res = await axios.get(url);
        if (res.data.image_link) imageLinks.push(res.data.image_link);
      }

      if (imageLinks.length === 0) return message.reply("❌ Failed to generate images.");

      // Create a collage of the images
      const loadedImages = await Promise.all(imageLinks.map(img => loadImage(img)));
      const width = loadedImages[0].width;
      const height = loadedImages[0].height;
      const canvas = createCanvas(width * 2, height * 2);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(loadedImages[0], 0, 0, width, height);
      ctx.drawImage(loadedImages[1], width, 0, width, height);
      ctx.drawImage(loadedImages[2], 0, height, width, height);
      ctx.drawImage(loadedImages[3], width, height, width, height);

      // Save the combined image
      const cacheFolderPath = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheFolderPath)) fs.mkdirSync(cacheFolderPath);

      const combinedImagePath = path.join(cacheFolderPath, `combined_${Date.now()}.jpg`);
      const buffer = canvas.toBuffer("image/jpeg");
      fs.writeFileSync(combinedImagePath, buffer);

      const labelText = `Reply with U1–U4 to upscale your favorite.`;

      return message.reply({
        body: labelText,
        attachment: fs.createReadStream(combinedImagePath)
      }, async (err, info) => {
        if (!err) {
          api.setMessageReaction("✅", event.messageID, () => {}, true);
          global.GoatBot.onReply.set(info.messageID, {
            commandName: "fastgen",
            author: event.senderID,
            images: imageLinks
          });
        }
      });

    } catch (err) {
      console.error("❌ Image generation error:", err.message);
      return message.reply("⚠️ Error occurred while generating or combining images.");
    }
  },

  onReply: async function({ event, message, Reply }) {
    const { author, images } = Reply;
    if (event.senderID !== author) return;

    const choice = event.body.trim().toUpperCase();
    const map = { U1: 0, U2: 1, U3: 2, U4: 3, "1": 0, "2": 1, "3": 2, "4": 3 };
    const index = map[choice];

    if (index === undefined || !images[index]) {
      return message.reply("❌ Please reply with U1–U4 or 1–4 only.");
    }

    return message.reply({
      body: `✅ Here's your selected image (${choice}):`,
      attachment: await global.utils.getStreamFromURL(images[index])
    });
  }
};
