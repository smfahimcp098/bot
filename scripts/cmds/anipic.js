const ok = 'xyz'; 

module.exports = {
  config: {
    name: "anipic",
    aliases: ["animepic"],
    author: "Team Calyx",
    category: "img",
  },
  onStart: async function ({ api, event }) {
    try {
      api.setMessageReaction("⏳", event.messageID, () => {}, true);
      const response = await global.utils.getStreamFromURL(`https://smfahim.${ok}/anipic`); 
      api.sendMessage({ body: "Anime image", attachment: response }, event.threadID, event.messageID);
      api.setMessageReaction("✅", event.messageID, () => {}, true);
    } catch (error) {
      console.error("Error fetching image:", error);
      api.sendMessage("Error fetching image. Please try again later.", event.threadID, event.messageID);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
    }
  },
};
