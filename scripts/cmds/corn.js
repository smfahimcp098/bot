const axios = require("axios");

module.exports = {
  config: {
    name: "corn",
    aliases: [],
    version: "1.0",
    author: "Fahim_Noob",
    role: 2,
    shortDescription: {
      en: "Corn video information"
    },
    longDescription: {
      en: "corn and send video details from a specific source"
    },
    category: "media",
    guide: {
      en: "{pn} corn [search keyword] - Search and fetch video by keyword"
    }
  },
  onStart: async function ({ api, event, args }) {
    const messageID = event.messageID;

    api.setMessageReaction("⏳", messageID, () => {}, true);

    if (args.length === 0) {
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage("Please provide a corn name to search.", event.threadID, null, messageID);
    }

    try {
      const query = args.join(" ");
      const o = 'x';

      let { data: { title, link_dl } } = await axios.get(`https://smfahim.${o}yz/${o}n${o}${o}?search=${encodeURIComponent(query)}`, {
        timeout: 30000
      });

      if (title && link_dl) {
        api.sendMessage({
          body: title,
          attachment: await global.utils.getStreamFromURL(link_dl, "video.mp4")
        }, event.threadID, () => {
          api.setMessageReaction("✅", messageID, () => {}, true);
        }, messageID);
      } else {
        api.setMessageReaction("❌", messageID, () => {}, true);
        api.sendMessage("No video found with the provided keyword.", event.threadID, null, messageID);
      }

    } catch (error) {
      api.setMessageReaction("❌", messageID, () => {}, true);
      
      if (error.code === 'ESOCKETTIMEDOUT') {
        api.sendMessage("Connection timed out. Please try again later.", event.threadID, null, messageID);
      } else {
        api.sendMessage("Sorry, an error occurred while fetching the video.", event.threadID, null, messageID);
      }
    }
  }
};