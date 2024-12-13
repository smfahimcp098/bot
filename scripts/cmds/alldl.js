const axios = require('axios');
const ok = 'xyz';

module.exports = {
  config: {
    name: "alldl",
    aliases: ["download"],
    version: "1.6",
    author: "Team Calyx",
    countDown: 5,
    role: 0,
    longDescription: "Download Videos from various Sources.",
    category: "media",
    guide: { en: { body: "{pn} [video link]" } }
  },

  onStart: async function({ message, args, event, threadsData, role }) {
    let videoUrl = args.join(" ");

    if ((args[0] === 'chat' && (args[1] === 'on' || args[1] === 'off')) || args[0] === 'on' || args[0] === 'off') {
      if (role >= 1) {
        const choice = args[0] === 'on' || args[1] === 'on';
        await threadsData.set(event.threadID, { data: { autoDownload: choice } });
        return message.reply(`Auto-download has been turned ${choice ? 'on' : 'off'} for this group.`);
      } else {
        return message.reply("You don't have permission to toggle auto-download.");
      }
    }

    if (!videoUrl) {
      if (event.messageReply && event.messageReply.body) {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const foundURLs = event.messageReply.body.match(urlRegex);
        if (foundURLs && foundURLs.length > 0) {
          videoUrl = foundURLs[0];
        } else {
          return message.reply("No URL found. Please provide a valid URL.");
        }
      } else {
        return message.reply("Please provide a URL to start downloading.");
      }
    }

    message.reaction("⏳", event.messageID);
    await download({ videoUrl, message, event });
  },

  onChat: async function({ event, message, threadsData }) {
    const threadData = await threadsData.get(event.threadID);
    if (!threadData.data.autoDownload || threadData.data.autoDownload === false || event.senderID === global.botID) return;

    try {
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const foundURLs = event.body.match(urlRegex);

      if (foundURLs && foundURLs.length > 0) {
        const videoUrl = foundURLs[0];
        message.reaction("⏳", event.messageID); 
        await download({ videoUrl, message, event });
      }
    } catch (error) {
      //message.reaction("❌", event.messageID);
      console.error("onChat Error:", error);
    }
  }
};

async function download({ videoUrl, message, event }) {
  try {
    const apiResponse = await axios.get(`https://smfahim.${ok}/alldl?url=${encodeURIComponent(videoUrl)}`);
    const videoData = apiResponse.data;

    if (!videoData || !videoData.links) {
      throw new Error("Invalid response from API.");
    }

    const videoStream = await axios({
      method: 'get',
      url: videoData.links.sd || videoData.links.hd,
      responseType: 'stream'
    });

    message.reaction("✅", event.messageID);

    message.reply({
      body: `${videoData.title}`,
      attachment: videoStream.data
    });
  } catch (error) {
    message.reaction("❌", event.messageID);
    console.error("Download Error:", error);
  }
}
