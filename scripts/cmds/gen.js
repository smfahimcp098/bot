const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");

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
    name: "gen",
    aliases: [],
    author: "Team Calyx - Modified by Fahim_Noob",
    version: "1.3",
    countDown: 5,
    role: 0,
    shortDescription: "Generate and select images using XL3.1 Model.",
    longDescription: "Generates four images based on a prompt and allows the user to select one.",
    category: "ai",
    guide: {
      en: `• {p}{n} <prompt> [--ar <ratio>] [--s <style>], or reply to an image\nAvailable Styles:\n• 1. Cinematic\n• 2. Photographic\n• 3. Anime\n• 4. Manga\n• 5. Digital Art\n• 6. Pixel Art\n• 7. Fantasy Art\n• 8. Neon Punk\n• 9. 3D Model`
    }
  },

  onStart: async function ({ message, args, api, event }) {
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
      if (!prompt) return message.reply("❌ | Please provide a prompt.");
      if (style && !styleMap[style]) {
        return message.reply(`❌ | Invalid style: ${style}. Please use a valid number (1-9).`);
      }

      const styledPrompt = `${prompt}, ${styleMap[style] || ""}`.trim();
      const startTime = Date.now();
      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      const urls = Array(4).fill("https://smfahim.xyz/creartai");

      const responses = await Promise.all(
        urls.map(url => axios.get(url, {
          params: { prompt: styledPrompt, ratio },
          responseType: "arraybuffer"
        }))
      );

      const images = await Promise.all(
        responses.map(res => loadImage(Buffer.from(res.data)))
      );

      const [wRatio, hRatio] = ratio.split(":").map(Number);
      const singleWidth = 1600;
      const singleHeight = Math.floor((singleWidth * hRatio) / wRatio);
      const canvas = createCanvas(singleWidth * 2, singleHeight * 2);
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.drawImage(images[0], 0, 0, singleWidth, singleHeight);
      ctx.drawImage(images[1], singleWidth, 0, singleWidth, singleHeight);
      ctx.drawImage(images[2], 0, singleHeight, singleWidth, singleHeight);
      ctx.drawImage(images[3], singleWidth, singleHeight, singleWidth, singleHeight);

      const outputPath = path.join(__dirname, "tmp", `combined_${Date.now()}.jpg`);
      fs.writeFileSync(outputPath, canvas.toBuffer("image/jpeg"));

      const reply = await message.reply({
        body: `Select an image by replying with 1, 2, 3, or 4.\nTime taken: ${((Date.now() - startTime) / 1000).toFixed(2)}s`,
        attachment: fs.createReadStream(outputPath)
      });

      global.GoatBot.onReply.set(reply.messageID, {
        commandName: this.config.name,
        images: responses.map((res, i) => {
          const file = path.join(__dirname, "tmp", `img_${Date.now()}_${i}.jpg`);
          fs.writeFileSync(file, res.data);
          return file;
        }),
        combinedImage: outputPath,
        author: event.senderID
      });

    } catch (err) {
      console.error(err);
      message.reply("❌ | Failed to generate image.");
      api.setMessageReaction("❌", event.messageID, () => {}, true);
    }
  },

  onReply: async function ({ event, Reply, message }) {
    const index = parseInt(event.body.trim());
    if (isNaN(index) || index < 1 || index > 4) {
      return message.reply("❌ | Invalid selection. Please reply with 1-4.");
    }

    const selectedImage = Reply.images[index - 1];
    if (selectedImage && fs.existsSync(selectedImage)) {
      return message.reply({
        attachment: fs.createReadStream(selectedImage)
      });
    } else {
      return message.reply("❌ | Selected image not found.");
    }
  }
};
