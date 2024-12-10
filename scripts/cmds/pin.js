const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const tuntuni = 'xyz';

module.exports = {
  config: {
    name: "pin",
    aliases: ["pinterest"],
    version: "1.0.2",
    author: "Fahim_Noob",
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
      en: "{prefix}pin <search query> | <number of images> (optional)"
    }
  },

  onStart: async function ({ api, event, args }) {
    try {
      const keySearch = args.join(" ");
      
      let searchQuery = keySearch;
      let numberOfImages = 1;

      if (keySearch.includes("-")) {
        searchQuery = keySearch.split("-")[0].trim();
        numberOfImages = parseInt(keySearch.split("-")[1].trim()) || 1;
      }

      let apiUrl = `https://smfahim.${tuntuni}/pin?title=${encodeURIComponent(searchQuery)}`;
      if (numberOfImages > 1) {
        apiUrl += `&search=${numberOfImages}`;
      }

      const res = await axios.get(apiUrl);
      const data = res.data;

      if (!data || !Array.isArray(data.data) || data.data.length === 0) {
        return api.sendMessage(`No images found for "${searchQuery}". Please try another search query.`, event.threadID, event.messageID);
      }

      const imgData = [];
      for (let i = 0; i < Math.min(numberOfImages, data.data.length); i++) {
        const imageUrl = data.data[i];
        try {
          const imgResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
          const imgPath = path.join(__dirname, 'cache', `${i + 1}.jpg`);
          await fs.outputFile(imgPath, imgResponse.data);
          imgData.push(fs.createReadStream(imgPath));
        } catch (error) {
          console.error(`Error fetching image ${i + 1}:`, error);
        }
      }

      await api.sendMessage({
        attachment: imgData,
        body: `Here are the top ${imgData.length} image results for "${searchQuery}":`
      }, event.threadID, event.messageID);

      await fs.remove(path.join(__dirname, 'cache'));

    } catch (error) {
      console.error("Error:", error);
      return api.sendMessage("An error occurred while processing your request. Please try again later.", event.threadID, event.messageID);
    }
  }
};