// const axios = require("axios");
// const fs = require("fs");

// const apiBaseUrl = `https://smfahim.xyz/sing`;

// module.exports = {
//   config: {
//     name: "sing",
//     version: "1.4",
//     aliases: ["song"],
//     author: "Team Calyx",
//     countDown: 5,
//     role: 0,
//     description: {
//       en: "Search and download audio from YouTube"
//     },
//     category: "media",
//     guide: {
//       en: "{pn} <search term or URL>: search YouTube and download audio"
//     }
//   },

//   onStart: async ({ api, args, event }) => {
//     let videoURL = args.join(" ");

//     if (!videoURL) {
//       if (event.messageReply && event.messageReply.body) {
//         const urlRegex = /(https?:\/\/[^\s]+)/g;
//         const foundURLs = event.messageReply.body.match(urlRegex);
//         if (foundURLs && foundURLs.length > 0) {
//           videoURL = foundURLs[0];
//         } else {
//           return api.sendMessage("❌ No URL found in the replied message. Please provide a valid URL.", event.threadID, event.messageID);
//         }
//       } else {
//         return api.sendMessage("❌ Please provide a search term or URL.", event.threadID, event.messageID);
//       }
//     }

//     const isUrl = videoURL.startsWith("http://") || videoURL.startsWith("https://");

//     try {
//       api.setMessageReaction("⏳", event.messageID, () => {}, true);

//       let response;
//       if (isUrl) {
//         response = await axios.get(`${apiBaseUrl}?url=${encodeURIComponent(videoURL)}`);
//       } else {
//         response = await axios.get(`${apiBaseUrl}?search=${encodeURIComponent(videoURL)}`);
//       }

//       const { link, title } = response.data;

//       if (!link) {
//         api.setMessageReaction("❌", event.messageID, () => {}, true);
//       }

//       const audioPath = `ytb_audio_${Date.now()}.mp3`;

//       const audioResponse = await axios.get(link, { responseType: "arraybuffer" });
//       fs.writeFileSync(audioPath, Buffer.from(audioResponse.data));
//       api.setMessageReaction("✅", event.messageID, () => {}, true);
//       const titleBody = `• Title: ${title}`;
//       await api.sendMessage(
//         {
//           body: titleBody,
//           attachment: fs.createReadStream(audioPath)
//         },
//         event.threadID,
//         () => {
//           fs.unlinkSync(audioPath);
//         },
//         event.messageID
//       );
//     } catch (error) {
//       console.error(error);
//       api.setMessageReaction("❌", event.messageID, () => {}, true);
//     }
//   }
// };



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
    category: "𝗠𝗘𝗗𝗜𝗔",
    guide: "{pn} <song name or youtube link>"
  },

  onStart: async function ({ message, event, args, api }) {
    const query = args.join(" ");
    if (!query) {
      return message.reply("Please provide a song name or YouTube link.");
    }

    message.reaction('⏳', event.messageID);
    let videoUrl;
    let searchResults;

    if (query.includes("youtube.com") || query.includes("youtu.be")) {
      videoUrl = query; 
    } else {
      searchResults = await yts(query); 
      if (searchResults.videos.length === 0) {
        return message.reply("No songs found for your query.");
      }
      videoUrl = searchResults.videos[0].url; 
    }
    try{
        const apiUrl2 = await getApiUrl();
           if(!apiUrl2){
             return  message.reply("❌ | Failed to fetch API URL.")
           }

     const downloadUrl = `${apiUrl2}/audio?url=${encodeURIComponent(videoUrl)}`;
       const response = await axios({
        method: 'GET',
        url: downloadUrl,
        responseType: 'stream'
      });

      const contentDisposition = response.headers['content-disposition'];
      let title = "song";

      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+?)\.mp3"/);
        if (match) {
          title = match[1];
        }
      }

      const fileName = `${title}.mp3`;
      const filePath = path.join(__dirname, "cache", fileName);

      const fileStream = fs.createWriteStream(filePath);
      response.data.pipe(fileStream);

      fileStream.on('finish', () => {
        message.reply(
          {
            body: `TITLE: ${title}`,
            attachment: fs.createReadStream(filePath)
          },
          event.threadID,
          event.messageID,
          () => {
            fs.unlink(filePath, (err) => {
              if (err) console.error("Error deleting file:", err);
            });
          }
        );
      });

      fileStream.on('error', (err) => {
        console.error("Error writing file:", err);
        message.reaction('❌', event.messageID);
      });

       await message.reaction('✅', event.messageID);
    } catch (error) {
        console.error("Error downloading or sending audio:", error);
        message.reaction('❌', event.messageID);
     }
   }
 };
async function getApiUrl() {
    try {
        const response = await axios.get("https://raw.githubusercontent.com/Savage-Army/extras/refs/heads/main/api.json");
        return response.data.api;
    } catch (error) {
        console.error("Error fetching API URL:", error);
        return null;
    }
}
