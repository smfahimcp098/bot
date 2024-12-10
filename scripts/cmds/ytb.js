const axios = require("axios");
const fs = require("fs");

const searchApiUrl = "https://team-calyx.onrender.com/ytb?search=";
const downloadAudioUrl = "https://team-calyx.onrender.com/ytb?url=";
const downloadVideoUrl = "https://team-calyx.onrender.com/ytb2?url=";

module.exports = {
  config: {
    name: "ytb",
    version: "1.3",
    aliases: ["youtube"],
    author: "Team Calyx | Fahim Calyx",
    countDown: 5,
    role: 0,
    description: {
      en: "Search and download video or audio from YouTube"
    },
    category: "media",
    guide: {
      en: "{pn} -v <search term>: search YouTube and download selected video\n{pn} -a <search term>: search YouTube and download selected audio"
    }
  },

  onStart: async ({ api, args, event, commandName }) => {
    if (args.length < 2 || (args[0] !== "-v" && args[0] !== "-a")) {
      return api.sendMessage("❌ Please use the format '/ytb -v <search term>' or '/ytb -a <search term>'.", event.threadID, event.messageID);
    }

    const searchTerm = args.slice(1).join(" ");

    try {
      const { data } = await axios.get(`${searchApiUrl}${encodeURIComponent(searchTerm)}`);
      const videos = data.slice(0, 6);

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
          attachment: await Promise.all(videos.map(video => downloadThumbnail(video.thumbnail, `thumbnail_${video.url.split("v=")[1]}.jpg`)))
        },
        event.threadID,
        (err, info) => {
          global.GoatBot.onReply.set(info.messageID, {
            commandName,
            messageID: info.messageID,
            author: event.senderID,
            videos,
            searchType: args[0]
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
    const choice = parseInt(event.body);
    if (isNaN(choice) || choice <= 0 || choice > Reply.videos.length) {
      return api.sendMessage("❌ Please enter a valid number.", event.threadID, event.messageID);
    }

    const selectedVideo = Reply.videos[choice - 1];
    const videoUrl = selectedVideo.url;

    try {
      if (Reply.searchType === "-a") {
        const { data } = await axios.get(`${downloadAudioUrl}${videoUrl}`);
        const audioUrl = data.audioUrl;

        const audioPath = `ytb_audio_${videoUrl.split("v=")[1]}.mp3`;
        const audioResponse = await axios.get(audioUrl, { responseType: "arraybuffer" });
        fs.writeFileSync(audioPath, Buffer.from(audioResponse.data));

        await api.sendMessage(
          {
            body: `📥 Audio download successful:\n• Title: ${selectedVideo.title}\n• Channel: ${selectedVideo.author.name}`,
            attachment: fs.createReadStream(audioPath)
          },
          event.threadID,
          () => fs.unlinkSync(audioPath),
          event.messageID
        );
      } else {
        const { data } = await axios.get(`${downloadVideoUrl}${videoUrl}`);
        const downloadUrl = data.videoUrl;
        const videoPath = `ytb_video_${videoUrl.split("v=")[1]}.mp4`;

        const videoResponse = await axios.get(downloadUrl, { responseType: "arraybuffer" });
        fs.writeFileSync(videoPath, Buffer.from(videoResponse.data));

        await api.sendMessage(
          {
            body: `📥 Video download successful:\n• Title: ${selectedVideo.title}\n• Channel: ${selectedVideo.author.name}`,
            attachment: fs.createReadStream(videoPath)
          },
          event.threadID,
          () => fs.unlinkSync(videoPath),
          event.messageID
        );
      }
    } catch (e) {
      console.error(e);
      return api.sendMessage("❌ Failed to download.", event.threadID, event.messageID);
    }
  }
};

async function downloadThumbnail(url, pathName) {
  try {
    const response = await axios.get(url, { responseType: "stream" });
    response.data.path = pathName;
    return response.data;
  } catch (err) {
    throw err;
  }
}