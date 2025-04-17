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
    name: "gen2",
    aliases: [],
    author: "Team Calyx",
    version: "1.2",
    countDown: 5,
    role: 0,
    shortDescription: `Generate and select images using XL3.1 Model.`,
    longDescription: "Generates four images based on a prompt and allows the user to select one.",
    category: "AI",
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
        return message.reply(`❌ | Invalid style: ${style}. Please provide a valid style number (1-9).• \nAvailable Styles:\n• 1. Cinematic\n• 2. Photographic\n• 3. Anime\n• 4. Manga\n• 5. Digital Art\n• 6. Pixel Art\n• 7. Fantasy Art\n• 8. Neon Punk\n• 9. 3D Model`);
      }

      const startTime = Date.now();
      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      const styledPrompt = `${prompt}, ${styleMap[style] || ""}`.trim();
      const params = { prompt: styledPrompt, ratio };

      const urls = [
        "https://smfahim.xyz/creartai",
        "https://smfahim.xyz/creartai",
        "https://smfahim.xyz/creartai",
        "https://smfahim.xyz/creartai"
      ];

      const imagePromises = urls.map((url) =>
        axios.get(url, { params, responseType: "stream" })
      );
      const responses = await Promise.all(imagePromises);

      const cacheFolderPath = path.join(__dirname, "/tmp");
      if (!fs.existsSync(cacheFolderPath)) {
        fs.mkdirSync(cacheFolderPath);
      }

      const images = await Promise.all(
        responses.map((response, index) => {
          const imagePath = path.join(cacheFolderPath, `image_${index + 1}.jpg`);
          const writer = fs.createWriteStream(imagePath);
          response.data.pipe(writer);
          return new Promise((resolve, reject) => {
            writer.on("finish", () => resolve(imagePath));
            writer.on("error", reject);
          });
        })
      );

      const [w, h] = ratio.split(":").map(Number);
      const resizeWidth = 1600;
      const resizeHeight = Math.floor((resizeWidth * h) / w);

      const canvas = createCanvas(resizeWidth * 2, resizeHeight * 2);
      const ctx = canvas.getContext("2d");

      const loadedImages = await Promise.all(
        images.map((img) => loadImage(img))
      );

      ctx.drawImage(loadedImages[0], 0, 0, resizeWidth, resizeHeight);
      ctx.drawImage(loadedImages[1], resizeWidth, 0, resizeWidth, resizeHeight);
      ctx.drawImage(loadedImages[2], 0, resizeHeight, resizeWidth, resizeHeight);
      ctx.drawImage(loadedImages[3], resizeWidth, resizeHeight, resizeWidth, resizeHeight);

      const combinedImagePath = path.join(cacheFolderPath, `image_combined_${Date.now()}.jpg`);
      const out = fs.createWriteStream(combinedImagePath);
      const stream = canvas.createJPEGStream();
      stream.pipe(out);

      await new Promise((resolve, reject) => {
        out.on("finish", resolve);
        out.on("error", reject);
      });

      const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);
      api.setMessageReaction("✅", event.messageID, () => {}, true);

      const reply = await message.reply({
        body: `Select an image by replying with 1, 2, 3, or 4.\n\nTime taken: ${timeTaken} seconds`,
        attachment: fs.createReadStream(combinedImagePath)
      });

      global.GoatBot.onReply.set(reply.messageID, {
        commandName: this.config.name,
        images,
        combinedImage: combinedImagePath,
        author: event.senderID
      });

      setTimeout(() => {
        global.GoatBot.onReply.delete(reply.messageID);
        images.forEach((img) => fs.unlinkSync(img));
        fs.unlinkSync(combinedImagePath);
      }, 300000);
    } catch (error) {
      console.error(error);
      message.reply("❌ | Failed to generate images. Please try again later.");
      api.setMessageReaction("❌", event.messageID, () => {}, true);
    }
  },

  onReply: async function ({ event, Reply, message }) {
    const index = parseInt(event.body.trim());
    if (isNaN(index) || index < 1 || index > 4) {
      return message.reply("❌ | Invalid selection. Please reply with a number between 1 and 4.");
    }

    const selectedImagePath = Reply.images[index - 1];
    if (selectedImagePath) {
      await message.reply({
        attachment: fs.createReadStream(selectedImagePath)
      });
    } else {
      await message.reply("❌ | The image selection was invalid. Please try again.");
    }
  }
};
