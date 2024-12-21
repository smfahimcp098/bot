const fs = require("fs");
const path = require("path");
const axios = require("axios");
const sharp = require("sharp");

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
    name: "fluxpro",
    aliases: [],
    author: "Vincenzo",
    version: "1.2",
    cooldowns: 5,
    role: 0,
    shortDescription: "Generate and select images using Flux 1.1 pro.",
    longDescription: "Generates four images based on a prompt and allows the user to select one.",
    category: "AI",
    guide: "{pn} <prompt> [--ar <ratio>] [--s <style>]"
  },

  onStart: async function ({ message, args, api, event }) {
    const startTime = Date.now();

    try {
      // Parse prompt, ratio, and style
      let prompt = "";
      let ratio = "1:1";
      let style = "";

      for (let i = 0; i < args.length; i++) {
        if (args[i].startsWith("--ar=")) {
          ratio = args[i].split("=")[1];
        } else if (args[i] === "--ar" && args[i + 1]) {
          ratio = args[i + 1];
          i++;
        } else if (args[i].startsWith("--s=")) {
          style = args[i].split("=")[1];
        } else if (args[i] === "--s" && args[i + 1]) {
          style = args[i + 1];
          i++;
        } else {
          prompt += args[i] + " ";
        }
      }

      prompt = prompt.trim();
      if (!prompt) return message.reply("❌ | Please provide a prompt.");
      if (style && !styleMap[style]) return message.reply("❌ | Invalid style: ${style}. Please provide a valid style number (1-9).");
      
      api.setMessageReaction("⏳", event.messageID, () => {}, true);


      const styledPrompt = `${prompt}, ${styleMap[style] || ""}`.trim();
      const urls = Array(4).fill(`https://smfahim.xyz/fluxpro/gen`);
      const cacheFolder = path.join(__dirname, "/tmp");

      if (!fs.existsSync(cacheFolder)) fs.mkdirSync(cacheFolder);

      // Fetch images
      const responses = await Promise.all(urls.map((url) =>
        axios.get(url, { params: { prompt: styledPrompt, ratio } })
      ));

      const images = await Promise.all(
        responses.map(async (res, idx) => {
          const imgURL = res.data.imageUrl;
          const imgPath = path.join(cacheFolder, `img_${idx + 1}_${Date.now()}.jpg`);
          const imgRes = await axios({ url: imgURL, responseType: "stream" });
          imgRes.data.pipe(fs.createWriteStream(imgPath));
          await new Promise((resolve) => imgRes.data.on("end", resolve));
          return imgPath;
        })
      );

      // Resize images
      const [w, h] = ratio.split(":").map(Number);
      const [resizeW, resizeH] = [512, (512 * h) / w];
      const buffers = await Promise.all(images.map((img) => sharp(img).resize(resizeW, resizeH).toBuffer()));

      // Combine images into grid
      const combinedPath = path.join(cacheFolder, `combined_${Date.now()}.jpg`);
      await sharp({ create: { width: resizeW * 2, height: resizeH * 2, channels: 3, background: { r: 255, g: 255, b: 255 } } })
        .composite([
          { input: buffers[0], left: 0, top: 0 },
          { input: buffers[1], left: resizeW, top: 0 },
          { input: buffers[2], left: 0, top: resizeH },
          { input: buffers[3], left: resizeW, top: resizeH }
        ])
        .toFile(combinedPath);

      const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);
      api.setMessageReaction("✅", event.messageID, () => {}, true);

      const reply = await message.reply({
        body: `Select an image by replying with 1, 2, 3, or 4.\nTime: ${timeTaken} seconds.`,
        attachment: fs.createReadStream(combinedPath)
      });

      global.GoatBot.onReply.set(reply.messageID, {
        commandName: this.config.name,
        messageID: reply.messageID,
        images,
        combinedImage: combinedPath,
        author: event.senderID
      });

      setTimeout(() => {
        global.GoatBot.onReply.delete(reply.messageID);
        images.forEach((img) => fs.unlinkSync(img));
        fs.unlinkSync(combinedPath);
      }, 300000);
    } catch (error) {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      console.error(error.message);
      message.reply("❌ | An error occurred. Please try again.");
    }
  },

  onReply: async function ({ api, event, Reply }) {
    try {
      const index = parseInt(event.body.trim());
      if (isNaN(index) || index < 1 || index > 4) {
        return message.reply("❌ | Invalid selection. Choose 1-4.");
      }

      const selectedImage = Reply.images[index - 1];
      await message.reply({ attachment: fs.createReadStream(selectedImage) });
    } catch (error) {
      console.error(error.message);
      message.reply("❌ | Unable to send selected image.");
    }
  }
};
