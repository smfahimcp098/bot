const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "sing2",
    version: "1.4",
    author: "Team Calyx",
    countDown: 5,
    role: 0,
    description: {
      en: "Plays or downloads a music track from the given song name or YouTube URL."
    },
    category: "music",
    guide: {
      en: "Type the command followed by the song name or YouTube URL to play or download the music."
    }
  },
  langs: {
    en: {
      syntaxError: "Please provide a valid song name or YouTube URL!",
      fetchError: "Error occurred while fetching the song."
    }
  },

  onStart: async function ({ message, event, args, getLang, api }) {
    const input = args.join(" ");
    if (!input) return message.reply(getLang('syntaxError'));

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      let url;
      let downloadUrl;
      let title;

      if (input.startsWith("http")) {
        url = `https://team-calyx-sing.replit.app/sing?url=${encodeURIComponent(input)}`;
        const response = await axios.get(url);
        downloadUrl = response.data.data.downloadUrl;
        title = "Downloaded from YouTube URL";  
      } 
      else {
        url = `https://team-calyx-sing.replit.app/sing?search=${encodeURIComponent(input)}`;
        const response = await axios.get(url);
        downloadUrl = response.data.audioUrls.data.downloadUrl;
        title = response.data.title;
      }

      if (!downloadUrl) {
        return message.reply(getLang('fetchError'));
      }

      const audioFilePath = path.resolve(__dirname, "music.mp3");
      const writer = fs.createWriteStream(audioFilePath);

      const downloadResponse = await axios({
        url: downloadUrl,
        method: 'GET',
        responseType: 'stream'
      });

      downloadResponse.data.pipe(writer);

      writer.on('finish', async () => {
        await message.reply({
          body: title,
          attachment: fs.createReadStream(audioFilePath)
        });

        fs.unlink(audioFilePath, (err) => {
          if (err) console.error("Error deleting the file:", err);
        });

        api.setMessageReaction("✅", event.messageID, () => {}, true);
      });

      writer.on('error', (err) => {
        console.error(err);
        message.reply(getLang('fetchError'));
      });

    } catch (error) {
      console.error(error);
      message.reply(getLang('fetchError'));
    }
  }
};