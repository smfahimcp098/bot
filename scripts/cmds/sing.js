const axios = require("axios");
const fs = require("fs");
const yts = require("yt-search");

const downloadBaseUrl = "https://team-calyx.onrender.com/ytb?url=";

module.exports = {
  config: {
    name: "sing",
    version: "1.1",
    aliases: ["song"],
    author: "Team Calyx",
    countDown: 5,
    role: 0,
    description: {
      en: "Search and download audio from YouTube"
    },
    category: "media",
    guide: {
      en: "{pn} <search term>: search YouTube and download selected audio"
    }
  },

  onStart: async ({ api, args, event }) => {
    if (args.length < 1) {
      return api.sendMessage("❌ Please use the format '/sing <search term>'.", event.threadID, event.messageID);
    }

    const searchTerm = args.join(" ");

    try {
      const searchResults = await yts(searchTerm);
      const videos = searchResults.videos.slice(0, 6);

      if (videos.length === 0) {
        return api.sendMessage(`⭕ No results found for: ${searchTerm}`, event.threadID, event.messageID);
      }

      let msg = "";
      videos.forEach((video, index) => {
        msg += `${index + 1}. ${video.title}\nDuration: ${video.timestamp}\nChannel: ${video.author.name}\n\n`;
      });

      api.sendMessage(
        {
          body: msg + "Reply with a number to select.",
          attachment: await Promise.all(videos.map(video => fahimcalyx(video.thumbnail, `thumbnail_${video.videoId}.jpg`)))
        },
        event.threadID,
        (err, info) => {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: "sing",
            messageID: info.messageID,
            author: event.senderID,
            videos,
          });
        },
        event.messageID
      );
    } catch (error) {
      console.error(error);
      return api.sendMessage("❌ Failed to search YouTube.", event.threadID, event.messageID);
    }
  },

  onReply: async ({ event, api, Reply }) => {
    console.log("Reply Object:", Reply); // ডিবাগিং

    const choice = parseInt(event.body);
    if (isNaN(choice) || choice <= 0 || choice > Reply.videos.length) {
      return api.sendMessage("❌ Please enter a valid number.", event.threadID, event.messageID);
    }

    const selectedVideo = Reply.videos[choice - 1];
    const videoUrl = selectedVideo.url;

    try {
      const { data } = await axios.get(`${downloadBaseUrl}${videoUrl}`);
      
      if (!data.audioUrl || !data.audioUrl.endsWith(".mp3")) {
        return api.sendMessage("❌ Could not retrieve an MP3 file. Please try again with a different search.", event.threadID, event.messageID);
      }

      const audioUrl = data.audioUrl;
      const audioPath = `ytb_audio_${selectedVideo.videoId}.mp3`;
      const audioResponse = await axios.get(audioUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(audioPath, Buffer.from(audioResponse.data));

      await api.unsendMessage(Reply.messageID);

      await api.sendMessage(
        {
          body: `📥 Audio download successful:\n• Title: ${selectedVideo.title}\n• Channel: ${selectedVideo.author.name}`,
          attachment: fs.createReadStream(audioPath)
        },
        event.threadID,
        () => fs.unlinkSync(audioPath),
        event.messageID
      );
    } catch (e) {
      console.error(e);
      return api.sendMessage("❌ Failed to download.", event.threadID, event.messageID);
    }
  }
};

async function fahimcalyx(url, pathName) {
  try {
    const response = await axios.get(url, { responseType: "stream" });
    response.data.pipe(fs.createWriteStream(pathName));
    return new Promise((resolve) => {
      response.data.on("end", () => resolve(fs.createReadStream(pathName)));
    });
  } catch (error) {
    console.error(error);
    return null;
  }
}