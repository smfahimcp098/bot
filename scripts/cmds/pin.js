const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const tuntuni = 'xyz';

module.exports = {
  config: {
    name: "pin",
    aliases: ["pinterest"],
    version: "1.0.3",
    author: "S M Fahim",
    role: 0,
    countDown: 50,
    shortDescription: {
      en: "Search for images on Pinterest"
    },
    longDescription: {
      en: ""
    },
    category: "image",
    guide: {
      en: "{prefix}pin <search query> - <number of images> (optional)"
    }
  },

  onStart: async function ({ api, event, args }) {
    try {
      const keySearch = args.join(" ");
      let searchQuery = keySearch;
      let numberOfImages = 1;

      // parse optional count after a dash
      if (keySearch.includes("-")) {
        const parts = keySearch.split("-");
        searchQuery = parts[0].trim();
        numberOfImages = parseInt(parts[1].trim(), 10) || 1;
      }

      // build API URL
      let apiUrl = `https://smfahim.${tuntuni}/pin?title=${encodeURIComponent(searchQuery)}`;
      if (numberOfImages > 1) apiUrl += `&search=${numberOfImages}`;

      // fetch image URLs
      const res = await axios.get(apiUrl);
      const data = res.data;
      if (!data || !Array.isArray(data.data) || data.data.length === 0) {
        return api.sendMessage(`No images found for "${searchQuery}". Please try another query.`, event.threadID, event.messageID);
      }

      // download images
      const streams = [];
      const imgPaths = [];
      for (let i = 0; i < Math.min(numberOfImages, data.data.length); i++) {
        const imageUrl = data.data[i];
        try {
          const imgRes = await axios.get(imageUrl, { responseType: 'arraybuffer' });
          const fileName = `${Date.now()}_${i + 1}.jpg`;
          const imgPath = path.join(__dirname, 'cache', fileName);
          await fs.outputFile(imgPath, imgRes.data);
          streams.push(fs.createReadStream(imgPath));
          imgPaths.push(imgPath);
        } catch (err) {
          console.error(`Error fetching image ${i + 1}:`, err);
        }
      }

      // send images
      await api.sendMessage({
        body: `Here are the top ${streams.length} images for "${searchQuery}":`,
        attachment: streams
      }, event.threadID, event.messageID);

      // delete downloaded files
      for (const filePath of imgPaths) {
        try {
          await fs.unlink(filePath);
        } catch (err) {
          console.error(`Error deleting file ${filePath}:`, err);
        }
      }

    } catch (error) {
      console.error("Error in /pin command:", error);
      return api.sendMessage("An error occurred, please try again later.", event.threadID, event.messageID);
    }
  }
};
