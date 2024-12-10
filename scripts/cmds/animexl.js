const fs = require("fs");
const path = require("path");
const axios = require("axios");

const styleMap = {
  "1": "masterpiece, best quality, very aesthetic, absurdres, cinematic still, emotional, harmonious, vignette, highly detailed, high budget, bokeh, cinemascope, moody, epic, gorgeous, film grain, grainy",
  "2": "masterpiece, best quality, very aesthetic, absurdres, cinematic photo, 35mm photograph, film, bokeh, professional, 4k, highly detailed",
  "3": "masterpiece, best quality, very aesthetic, absurdres, anime artwork, anime style, key visual, vibrant, studio anime, highly detailed",
  "4": "masterpiece, best quality, very aesthetic, absurdres, manga style, vibrant, high-energy, detailed, iconic, Japanese comic style"
};

module.exports = {
  config: {
    name: "animexl",
    aliases: [],
    author: "Vincenzo",
    version: "1.0",
    cooldowns: 5,
    role: 1,
    shortDescription: "Generate a single image using Niji V5.",
    longDescription: "Generates a single image based on a prompt.",
    category: "AI",
    guide: "{pn} <prompt> [--ar <ratio>] [--s <style>]"
  },

  onStart: async function ({ message, args, api, event }) {
    const startTime = Date.now();
    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      let prompt = "";
      let ratio = "1:1";
      let style = "";

      // Parsing arguments
      args.forEach((arg, i) => {
        if (arg.startsWith("--ar=") || arg.startsWith("--ratio=")) {
          ratio = arg.split("=")[1];
        } else if (["--ar", "--ratio"].includes(arg) && args[i + 1]) {
          ratio = args[++i];
        } else if (arg.startsWith("--s=") || arg.startsWith("--style=")) {
          style = arg.split("=")[1];
        } else if (["--s", "--style"].includes(arg) && args[i + 1]) {
          style = args[++i];
        } else {
          prompt += `${arg} `;
        }
      });

      prompt = prompt.trim();

      if (style && !styleMap[style]) {
        throw new Error(`Invalid style: ${style}. Please provide a valid style number (1-4).`);
      }

      const styledPrompt = `${prompt}, ${styleMap[style] || ""}`.trim();
      const params = { prompt: styledPrompt, ratio };

      const cacheFolderPath = path.join(__dirname, "/tmp");
      if (!fs.existsSync(cacheFolderPath)) {
        fs.mkdirSync(cacheFolderPath);
      }

      const response = await axios.get("https://team-calyx.onrender.com/xlweb", { params });
      const imageURL = response.data.imageUrl;

      if (!imageURL) throw new Error("No image URL received from the API.");

      const currentDate = new Date();
      const dateTime = currentDate.toISOString().replace(/[:.]/g, "-");
      const imagePath = path.join(cacheFolderPath, `image_${dateTime}.png`);

      const writer = fs.createWriteStream(imagePath);
      const imageResponse = await axios({ url: imageURL, method: "GET", responseType: "stream" });
      imageResponse.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);
      api.setMessageReaction("✅", event.messageID, () => {}, true);

      await message.reply({
        body: `Here is your image.\n\nTime taken: ${timeTaken} seconds`,
        attachment: fs.createReadStream(imagePath)
      });

      setTimeout(() => fs.unlinkSync(imagePath), 300000);

    } catch (error) {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      console.error("Error:", error.response ? error.response.data : error.message);
      message.reply(`❌ | Failed to generate image. Error: ${error.message}`);
    }
  }
};