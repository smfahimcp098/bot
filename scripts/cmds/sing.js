const axios = require('axios');
const fs = require('fs');
const path = require('path');
const yts = require('yt-search');

module.exports = {
  config: {
    name: "sing",
    version: "1.0",
    author: "Team Calyx",
    countDown: 5,
    role: 0,
    shortDescription: "Play a song from YouTube",
    longDescription: "Search for a song on YouTube and play the audio",
    category: "media",
    guide: "{pn} <song name or YouTube link>"
  },

  onStart: async function ({ message, event, args, api }) {
    const query = args.join(" ");
    if (!query) {
      return message.reply("❌ | Please provide a song name or YouTube link.");
    }

    console.log('Received sing command with query:', query);
    message.reaction('⏳', event.messageID);

    let videoUrl;
    if (query.includes("youtube.com") || query.includes("youtu.be")) {
      videoUrl = query;
    } else {
      try {
        const searchResults = await yts(query);
        if (!searchResults || searchResults.videos.length === 0) {
          return message.reply("❌ | No songs found for your query.");
        }
        videoUrl = searchResults.videos[0].url;
      } catch (err) {
        console.error('Error during YouTube search:', err);
        return message.reply("❌ | Error occurred while searching for the song.");
      }
    }

    try {
      const apiUrl = `https://smfahim.xyz/sing?url=${encodeURIComponent(videoUrl)}`;
      const { data } = await axios.get(apiUrl);

      if (!data || !data.download_url) {
        return message.reply("❌ | Failed to get download link from API.");
      }

      const fileUrl = data.download_url;
      const streamRes = await axios({
        method: 'GET',
        url: fileUrl,
        responseType: 'stream'
      });

      let title = 'song';
      const contentDisp = streamRes.headers['content-disposition'];
      if (contentDisp) {
        const match = contentDisp.match(/filename="(.+?)\.(mp3|m4a)"/);
        if (match) title = match[1];
      }

      const fileName = `${title}.mp3`;
      const filePath = path.join(__dirname, 'cache', fileName);

      const writer = fs.createWriteStream(filePath);
      streamRes.data.pipe(writer);

      writer.on('finish', async () => {
        console.log('✅ | File downloaded:', filePath);
        message.reaction('✅', event.messageID);

        await message.reply({
          body: `🎵 | Here is your song: ${title}`,
          attachment: fs.createReadStream(filePath)
        });

        fs.unlink(filePath, (err) => {
          if (err) console.error('❌ | Error deleting file:', err);
          else console.log('🗑️ | File deleted successfully:', filePath);
        });
      });

      writer.on('error', (err) => {
        console.error('❌ | Error writing file:', err);
        message.reply("❌ | Failed to download the song.");
      });

    } catch (err) {
      console.error('❌ | General error:', err);
      message.reply("❌ | An unexpected error occurred while processing your request.");
    }
  }
};
