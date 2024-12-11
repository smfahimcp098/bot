const axios = require("axios");
const fs = require("fs");
const path = require("path");
const ok = "xyz";

module.exports = {
  config: {
    name: "alldl",
    aliases: ["aldl", "download"],
    version: "1.4",
    author: "Team Calyx",
    role: 0,
    shortDescription: {
      en: "Download video from a given URL and send it."
    },
    longDescription: {
      en: "Fetches video data from a provided URL and sends the downloadable video as an attachment."
    },
    category: "Media",
    guide: {
      en: "Provide a URL to download the video."
    }
  },
  onStart: async function ({ api, event, args }) {
    let videoURL = args.join(" ");

    if (!videoURL) {
      if (event.messageReply && event.messageReply.body) {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const foundURLs = event.messageReply.body.match(urlRegex);
        if (foundURLs && foundURLs.length > 0) {
          videoURL = foundURLs[0];
        } else {
          return api.sendMessage("No URL found. Please provide a valid URL.", event.threadID, event.messageID);
        }
      } else {
        return api.sendMessage("Please provide a URL to download the video.", event.threadID, event.messageID);
      }
    }

    const apiURL = `https://smfahim.${ok}/alldl?url=${encodeURIComponent(videoURL)}`;

    async function fetchVideoData(attempt = 1) {
      try {
        const response = await axios.get(apiURL, { timeout: 10000 });
        return response.data;
      } catch (error) {
        if (attempt < 2) {
          return await fetchVideoData(attempt + 1);
        }
        throw new Error("Failed to fetch video data .");
      }
    }

    try {
      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      const videoData = await fetchVideoData();
      const { links: { sd: downloadLink }, title } = videoData;

      if (!downloadLink) {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        return api.sendMessage("No SD video link found.", event.threadID, event.messageID);
      }

      const date_time = new Date().toISOString().replace(/[:.-]/g, "_");
      const videoPath = path.resolve(__dirname, `${date_time}.mp4`);
      const writer = fs.createWriteStream(videoPath);

      const videoResponse = await axios({
        url: downloadLink,
        method: "GET",
        responseType: "stream"
      });

      videoResponse.data.pipe(writer);

      writer.on("finish", () => {
        const stream = fs.createReadStream(videoPath);

        api.sendMessage({
          body: title,
          attachment: stream
        }, event.threadID, (err) => {
          if (!err) {
            api.setMessageReaction("✅", event.messageID, () => {}, true);
          } else {
            api.setMessageReaction("❌", event.messageID, () => {}, true);
          }
          fs.unlinkSync(videoPath);
        }, event.messageID);
      });

      writer.on("error", (err) => {
        console.error("Error writing video:", err);
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
      });
    } catch (error) {
      console.error("Error:", error.message);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
    }
  }
};        return api.sendMessage("Please provide a URL after the command or reply to a message containing a URL.", event.threadID, event.messageID);
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
