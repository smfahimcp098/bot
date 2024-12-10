const axios = require("axios");

module.exports = {
  config: {
    name: "alldl",
    aliases: ["aldl"],
    version: "1.0",
    author: "Fahim_Noob",
    role: 0,
    shortDescription: {
      en: "Retrieves and sends video from a provided URL."
    },
    longDescription: {
      en: "Retrieves video details from the provided URL and sends the video as an attachment."
    },
    category: "Media",
    guide: {
      en: "Use this command to retrieve video details and receive the video as an attachment. You can either provide a URL or reply to a message with a URL."
    }
  },
  onStart: async function ({ api, event, args }) {
    let videoURL = args.join(" ");

    // If no URL is provided in the command, check if it's a reply to a message
    if (!videoURL) {
      if (event.messageReply && event.messageReply.body) {
        const replyMessage = event.messageReply.body;
        // Extract URL from the reply message
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const foundURLs = replyMessage.match(urlRegex);
        if (foundURLs && foundURLs.length > 0) {
          videoURL = foundURLs[0];
        } else {
          return api.sendMessage("No URL found in the reply message.", event.threadID, event.messageID);
        }
      } else {
        return api.sendMessage("Please provide a URL after the command or reply to a message containing a URL.", event.threadID, event.messageID);
      }
    }

    const a = 'xyz';
    const apiURL = `https://smfahim.${a}/alldl?url=${encodeURIComponent(videoURL)}`;

    try {
      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      const response = await axios.get(apiURL);
      const { data: { url: { data: { low, title } } } } = response;

      if (!low) {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        return api.sendMessage("No video content available.", event.threadID, event.messageID);
      }

      const stream = await global.utils.getStreamFromURL(low, "video.mp4");

      api.sendMessage({
        body: title,
        attachment: stream
      }, event.threadID, (err, messageInfo) => {
        if (!err) {
          api.setMessageReaction("✅", event.messageID, () => {}, true);
        } else {
          api.setMessageReaction("❌", event.messageID, () => {}, true);
        }
      }, event.messageID);
    } catch (error) {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      api.sendMessage("An error occurred while retrieving video details.", event.threadID, event.messageID);
    }
  }
};