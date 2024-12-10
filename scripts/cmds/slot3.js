const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");

const aspectRatioMap = {
  '1:1': { width: 1024, height: 1024 },
  '9:7': { width: 1152, height: 896 },
  '7:9': { width: 896, height: 1152 },
  '19:13': { width: 1216, height: 832 },
  '13:19': { width: 832, height: 1216 },
  '7:4': { width: 1344, height: 768 },
  '4:7': { width: 768, height: 1344 },
  '12:5': { width: 1500, height: 625 },
  '5:12': { width: 640, height: 1530 },
  '16:9': { width: 1344, height: 756 },
  '9:16': { width: 756, height: 1344 },
  '2:3': { width: 1024, height: 1536 },
  '3:2': { width: 1536, height: 1024 }
};

module.exports = {
  config: {
    name: "pony2",
    aliases: [],
    author: "Vincenzo",
    version: "1.1",
    cooldowns: 5,
    role: 2,
    shortDescription: "Generate and select images using Niji V5.",
    longDescription: "Generates four images based on a prompt and allows the user to select one.",
    category: "AI",
    guide: "{p}niji5 <prompt> [--ar <ratio>] [--style <style>]"
  },

  onStart: async function ({ message, args, api, event }) {
    api.setMessageReaction("⏰", event.messageID, (err) => {}, true);

    const startTime = Date.now();
    try {
      let prompt = "";
      let ratio = "1:1";
      let style = "";

      for (let i = 0; i < args.length; i++) {
        if (args[i] === "--ar" && args[i + 1]) {
          ratio = args[i + 1];
          i++;
        } else if (args[i] === "--style" && args[i + 1]) {
          style = args[i + 1];
          i++;
        } else {
          prompt += args[i] + " ";
        }
      }

      prompt = prompt.trim();
      const ok = "xyz"; 
      const urls = [
        `https://smfahim.${ok}/pony2`,
        `https://smfahim.${ok}/pony2`,
        `https://smfahim.${ok}/pony2`,
        `https://smfahim.${ok}/pony2`
      ];
      const params = { prompt, style, ratio };
      const cacheFolderPath = path.join(__dirname, "/tmp");

      if (!fs.existsSync(cacheFolderPath)) {
        fs.mkdirSync(cacheFolderPath);
      }

      const imagePromises = urls.map((url) => axios.get(url, { params }));
      const responses = await Promise.all(imagePromises);

      const images = await Promise.all(
        responses.map(async (response, index) => {
          const imageURL = response.data.imageUrl;
          const imagePath = path.join(cacheFolderPath, `niji5_${index + 1}.jpg`);
          const writer = fs.createWriteStream(imagePath);
          
          const imageResponse = await axios({
            url: imageURL,
            method: "GET",
            responseType: "stream"
          });

          imageResponse.data.pipe(writer);
          await new Promise((resolve, reject) => {
            writer.on("finish", resolve);
            writer.on("error", reject);
          });
          return imagePath;
        })
      );

      const loadedImages = await Promise.all(images.map(img => loadImage(img)));

      const width = loadedImages[0].width;
      const height = loadedImages[0].height;
      const canvas = createCanvas(width * 2, height * 2);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(loadedImages[0], 0, 0, width, height);
      ctx.drawImage(loadedImages[1], width, 0, width, height);
      ctx.drawImage(loadedImages[2], 0, height, width, height);
      ctx.drawImage(loadedImages[3], width, height, width, height);

      const combinedImagePath = path.join(cacheFolderPath, `niji5_combined.jpg`);
      const buffer = canvas.toBuffer("image/jpeg");
      fs.writeFileSync(combinedImagePath, buffer);

      const endTime = Date.now();
      const timeTaken = ((endTime - startTime) / 1000).toFixed(2);

      const reply = await message.reply({
        body: `Select an image by responding with 1, 2, 3, or 4.\n\nTime taken: ${timeTaken} seconds`,
        attachment: fs.createReadStream(combinedImagePath)
      });

      const data = {
        commandName: this.config.name,
        messageID: reply.messageID,
        images: images,
        author: event.senderID
      };

      global.GoatBot.onReply.set(reply.messageID, data);

      setTimeout(() => {
        global.GoatBot.onReply.delete(reply.messageID);
      }, 60000);

    } catch (error) {
      console.error("Error:", error.response ? error.response.data : error.message);
      message.reply("❌ | Failed to generate image.");
    }
  },

  onReply: async function ({ api, event, Reply, args, message }) {
    const reply = args[0];
    const { author, messageID, images } = Reply;

    if (event.senderID !== author) return;

    try {
      const validIndexes = ["1", "2", "3", "4"];
      if (validIndexes.includes(reply)) {
        const selectedImageIndex = parseInt(reply) - 1;
        const selectedImagePath = images[selectedImageIndex];

        await message.reply({
          attachment: fs.createReadStream(selectedImagePath)
        });
      } else {
        message.reply("❌ | Invalid action. Please select an index between 1-4.");
      }
    } catch (error) {
      console.error("Error:", error.message);
      message.reply("❌ | Failed to send the selected image.");
    }
  }
};