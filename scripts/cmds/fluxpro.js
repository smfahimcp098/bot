// const fs = require("fs");
// const path = require("path");
// const axios = require("axios");
// const { createCanvas, loadImage } = require("canvas");

// const styleMap = {
//   "1": "masterpiece, best quality, very aesthetic, absurdres, cinematic still, emotional, harmonious, vignette, highly detailed, high budget, bokeh, cinemascope, moody, epic, gorgeous, film grain, grainy",
//   "2": "masterpiece, best quality, very aesthetic, absurdres, cinematic photo, 35mm photograph, film, bokeh, professional, 4k, highly detailed",
//   "3": "masterpiece, best quality, very aesthetic, absurdres, anime artwork, anime style, key visual, vibrant, studio anime, highly detailed",
//   "4": "masterpiece, best quality, very aesthetic, absurdres, manga style, vibrant, high-energy, detailed, iconic, Japanese comic style",
//   "5": "masterpiece, best quality, very aesthetic, absurdres, concept art, digital artwork, illustrative, painterly, matte painting, highly detailed",
//   "6": "masterpiece, best quality, very aesthetic, absurdres, pixel-art, low-res, blocky, pixel art style, 8-bit graphics",
//   "7": "masterpiece, best quality, very aesthetic, absurdres, ethereal fantasy concept art, magnificent, celestial, ethereal, painterly, epic, majestic, magical, fantasy art, cover art, dreamy",
//   "8": "masterpiece, best quality, very aesthetic, absurdres, neonpunk style, cyberpunk, vaporwave, neon, vibes, vibrant, stunningly beautiful, crisp, detailed, sleek, ultramodern, magenta highlights, dark purple shadows, high contrast, cinematic, ultra detailed, intricate, professional",
//   "9": "masterpiece, best quality, very aesthetic, absurdres, professional 3d model, octane render, highly detailed, volumetric, dramatic lighting"
// };

// module.exports = {
//   config: {
//     name: "fluxpro2",
//     aliases: [],
//     author: "Vincenzo",
//     version: "1.1",
//     cooldowns: 5,
//     role: 1,
//     shortDescription: "Generate and select images using Niji V5.",
//     longDescription: "Generates four images based on a prompt and allows the user to select one.",
//     category: "AI",
//     guide: "{pn} <prompt> [--ar <ratio>] [--s <style>]",
//   },

//   onStart: async function ({ message, args, api, event }) {
//     const startTime = Date.now();
//     api.setMessageReaction("⏳", event.messageID, () => {}, true);

//     try {
//       let prompt = "";
//       let ratio = "1:1";
//       let style = "";

//       // Parsing arguments for prompt, ratio, and style
//       for (let i = 0; i < args.length; i++) {
//         if (args[i].startsWith("--ar=") || args[i].startsWith("--ratio=")) {
//           ratio = args[i].split("=")[1];
//         } else if ((args[i] === "--ar" || args[i] === "--ratio") && args[i + 1]) {
//           ratio = args[i + 1];
//           i++;
//         } else if (args[i].startsWith("--s=") || args[i].startsWith("--style=")) {
//           style = args[i].split("=")[1];
//         } else if ((args[i] === "--s" || args[i] === "--style") && args[i + 1]) {
//           style = args[i + 1];
//           i++;
//         } else {
//           prompt += args[i] + " ";
//         }
//       }

//       prompt = prompt.trim();

//       if (style && !styleMap[style]) {
//         api.setMessageReaction("❌", event.messageID, () => {}, true);
//         return message.reply(`❌ | Invalid style: ${style}. Please provide a valid style number (1-9).`);
//       }

//       const styledPrompt = `${prompt}, ${styleMap[style] || ""}`.trim();
//       const params = { prompt: styledPrompt, ratio };

//       const ok = "xyz"; // Update your domain dynamically
//       const urls = [
//         `https://smfahim.${ok}/fluxpro/gen`,
//         `https://smfahim.${ok}/fluxpro/gen`,
//         `https://smfahim.${ok}/fluxpro/gen`,
//         `https://smfahim.${ok}/fluxpro/gen`,
//       ];

//       const cacheFolderPath = path.join(__dirname, "/tmp");
//       if (!fs.existsSync(cacheFolderPath)) {
//         fs.mkdirSync(cacheFolderPath);
//       }

//       const imagePromises = urls.map((url) => axios.get(url, { params }));
//       const responses = await Promise.all(imagePromises);

//       const images = await Promise.all(
//         responses.map(async (response, index) => {
//           const imageURL = response.data.imageUrl;
//           const imagePath = path.join(cacheFolderPath, `image_${index + 1}_${Date.now()}.jpg`);
//           const writer = fs.createWriteStream(imagePath);

//           const imageResponse = await axios({
//             url: imageURL,
//             method: "GET",
//             responseType: "stream",
//           });

//           imageResponse.data.pipe(writer);
//           await new Promise((resolve, reject) => {
//             writer.on("finish", resolve);
//             writer.on("error", reject);
//           });
//           return imagePath;
//         })
//       );

//       const loadedImages = await Promise.all(images.map((img) => loadImage(img)));
//       const width = loadedImages[0].width;
//       const height = loadedImages[0].height;
//       const canvas = createCanvas(width * 2, height * 2);
//       const ctx = canvas.getContext("2d");

//       // Combining all four images into one
//       ctx.drawImage(loadedImages[0], 0, 0, width, height);
//       ctx.drawImage(loadedImages[1], width, 0, width, height);
//       ctx.drawImage(loadedImages[2], 0, height, width, height);
//       ctx.drawImage(loadedImages[3], width, height, width, height);

//       const combinedImagePath = path.join(cacheFolderPath, `image_combined_${Date.now()}.jpg`);
//       const buffer = canvas.toBuffer("image/jpeg");
//       fs.writeFileSync(combinedImagePath, buffer);

//       const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);
//       api.setMessageReaction("✅", event.messageID, () => {}, true);

//       const reply = await message.reply({
//         body: `Select an image by responding with 1, 2, 3, or 4.\n\nTime taken: ${timeTaken} seconds`,
//         attachment: fs.createReadStream(combinedImagePath),
//       });

//       const data = {
//         commandName: this.config.name,
//         messageID: reply.messageID,
//         images: images,
//         combinedImage: combinedImagePath,
//         author: event.senderID,
//       };

//       global.GoatBot.onReply.set(reply.messageID, data);

//       setTimeout(() => {
//         global.GoatBot.onReply.delete(reply.messageID);
//         images.forEach((image) => fs.unlinkSync(image));
//         fs.unlinkSync(combinedImagePath);
//       }, 300000);

//     } catch (error) {
//       api.setMessageReaction("❌", event.messageID, () => {}, true);
//       console.error("Error:", error.response ? error.response.data : error.message);
//       message.reply("❌ | Failed to generate image.");
//     }
//   },

//   onReply: async function ({ api, event, Reply, args, message }) {
//     try {
//       const index = parseInt(event.body.trim());
//       if (isNaN(index) || index < 1 || index > 4) {
//         return message.reply("❌ | Invalid selection. Please reply with a number between 1 and 4.");
//       }

//       const selectedImagePath = Reply.images[index - 1];
//       await message.reply({
//         attachment: fs.createReadStream(selectedImagePath),
//       });
//     } catch (error) {
//       console.error("Error:", error.message);
//       message.reply("❌ | Failed to send selected image.");
//     }
//   },
// };

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
    version: "1.1",
    cooldowns: 5,
    role: 0,
    shortDescription: "Generate and select images using Niji V5.",
    longDescription: "Generates four images based on a prompt and allows the user to select one.",
    category: "AI",
    guide: "{pn} <prompt> [--ar <ratio>] [--s <style>]"
  },
  onStart: async function ({ message, args, api, event }) {
    try {
      let prompt = "";
      let ratio = "1:1"; // Default ratio is 1:1
      let style = "";
      // Parse the arguments for prompt, ratio, and style
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
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        return message.reply(`❌ | Invalid style: ${style}. Please provide a valid style number (1-9).`);
      }
      const startTime = Date.now();
      api.setMessageReaction("⏳", event.messageID, () => {}, true);
      
      const styledPrompt = `${prompt}, ${styleMap[style] || ""}`.trim();
      const params = { prompt: styledPrompt, ratio };
      const ok = "xyz";
      const urls = [
        `http://smfahim.${ok}/fluxpro/gen`,
        `http://smfahim.${ok}/fluxpro/gen`,
        `http://smfahim.${ok}/fluxpro/gen`,
        `http://smfahim.${ok}/fluxpro/gen`
      ];
      const cacheFolderPath = path.join(__dirname, "/tmp");
      if (!fs.existsSync(cacheFolderPath)) {
        fs.mkdirSync(cacheFolderPath);
      }
      const imagePromises = urls.map((url) => axios.get(url, { params }));
      const responses = await Promise.all(imagePromises);
      const images = await Promise.all(
        responses.map(async (response, index) => {
          const imageURL = response.data.imageUrl;
          const imagePath = path.join(cacheFolderPath, `image_${index + 1}_${Date.now()}.jpg`);
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
      // Resize the images based on the ratio
      const [width, height] = ratio.split(":").map(Number);
      const resizeWidth = 512;
      const resizeHeight = Math.floor((resizeWidth * height) / width);
      const loadedImages = await Promise.all(
        images.map((img) => sharp(img).resize(resizeWidth, resizeHeight).toBuffer()) // Resize images based on ratio
      );
      const compositeImages = [
        { input: loadedImages[0], left: 0, top: 0 },
        { input: loadedImages[1], left: resizeWidth, top: 0 },
        { input: loadedImages[2], left: 0, top: resizeHeight },
        { input: loadedImages[3], left: resizeWidth, top: resizeHeight }
      ];
      const combinedImagePath = path.join(cacheFolderPath, `image_combined_${Date.now()}.jpg`);
      await sharp({
        create: {
          width: resizeWidth * 2,
          height: resizeHeight * 2,
          channels: 3,
          background: { r: 255, g: 255, b: 255 }
        }
      })
        .composite(compositeImages)
        .toFile(combinedImagePath);
      const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);
      api.setMessageReaction("✅", event.messageID, () => {}, true);
      const reply = await message.reply({
        body: `Select an image by responding with 1, 2, 3, or 4.\n\nTime taken: ${timeTaken} seconds`,
        attachment: fs.createReadStream(combinedImagePath)
      });
      const data = {
        commandName: this.config.name,
        messageID: reply.messageID,
        images: images,
        combinedImage: combinedImagePath,
        author: event.senderID
      };
      global.GoatBot.onReply.set(reply.messageID, data);
      setTimeout(() => {
        global.GoatBot.onReply.delete(reply.messageID);
        images.forEach((image) => fs.unlinkSync(image));
        fs.unlinkSync(combinedImagePath);
      }, 300000);
    } catch (error) {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      console.error("Error:", error.response ? error.response.data : error.message);
    }
  },
  onReply: async function ({ api, event, Reply, args, message }) {
    try {
      const index = parseInt(event.body.trim());
      if (isNaN(index) || index < 1 || index > 4) {
        return message.reply("❌ | Invalid selection. Please reply with a number between 1 and 4.");
      }
      const selectedImagePath = Reply.images[index - 1];
      await message.reply({
        attachment: fs.createReadStream(selectedImagePath)
      });
    } catch (error) {
      console.error("Error:", error.message);
      message.reply("❌ | Failed to send selected image.");
    }
  }
};
