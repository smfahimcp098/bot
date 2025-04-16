
const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "owner",
    aliases: ["info"],
    author: "kshitiz x Aesther ",// idea and half code stolen from mirai coded by Rickiel haha
    version: "2.0",
    cooldowns: 5,
    role: 0,
    shortDescription: {
      en: ""
    },
    longDescription: {
      en: "get bot owner info"
    },
    category: "info",
    guide: {
      en: "{p}owner"
    }
  },
  onStart: async function ({ api, event }) {
      try {
        const loadingMessage = "💬 | 𝙋𝙡𝙚𝙖𝙨𝙚 𝙬𝙖𝙞𝙩 𝙞𝙣𝙛𝙤𝙧𝙢𝙖𝙩𝙞𝙤𝙣 𝙡𝙤𝙖𝙙...";
        await api.sendMessage(loadingMessage, event.threadID);

        const ownerInfo = {
          name: '𝙎 𝙈 𝙁𝙖𝙝𝙞𝙢',
          gender: 'ᗰᗩᒪᗴ',
          hobby: '𝚐𝚊𝚖𝚒𝚗𝚐 𝚠𝚒𝚝𝚑 𝚌𝚘𝚌, 𝚝𝚎𝚊𝚌𝚑𝚎𝚛, 𝚓𝚞𝚜𝚝 𝚏𝚞𝚗 & 𝚌𝚒𝚕𝚕, 𝚌𝚘𝚊𝚍𝚒𝚗𝚐 file 𝚎𝚍𝚒𝚝𝚘𝚛 𝚎𝚝𝚌.',
          relationship: '𝚂𝚒𝚗𝚐𝚕𝚎',
          facebookLink: 'www.facebook.com/smfahim.official.bd',
          bio: '☘︎Hello! My owner/developer is Fahim Developer.\n☘︎This is my bot owner😗🌷'
        };

        const videoUrl = 'https://i.ibb.co/fVsJTz3L/1963da52a06.jpg';
        const tmpFolderPath = path.join(__dirname, 'tmp');

        if (!fs.existsSync(tmpFolderPath)) {
          fs.mkdirSync(tmpFolderPath);
        }

        const videoResponse = await axios.get(videoUrl, { responseType: 'arraybuffer' });
        const videoPath = path.join(tmpFolderPath, 'owner_video.jpg');

        fs.writeFileSync(videoPath, Buffer.from(videoResponse.data, 'binary'));

        const response = `
          𝗼𝘄𝗻𝗲𝗿 𝗶𝗻𝗳𝗼𝗿𝗺𝗮𝘁𝗶𝗼𝗻:
      ▣𝗡𝗔𝗠𝗘 : ${ownerInfo.name}
      ▣𝗚𝗘𝗡𝗗𝗘𝗥: ${ownerInfo.gender}
      ▣𝗛𝗢𝗕𝗕𝗬: ${ownerInfo.hobby}
      ▣𝗥𝗘𝗟𝗔𝗧𝗢𝗡𝗦𝗛𝗜𝗣: ${ownerInfo.relationship}
      ➤𝗙𝗔𝗖𝗘𝗕𝗢𝗢𝗞: ${ownerInfo.facebookLink}
      ◈ 𝗦𝗧𝗔𝗧𝗨𝗦 ◈: ${ownerInfo.bio}
        `;

        await api.sendMessage({
          body: response,
          attachment: fs.createReadStream(videoPath)
        }, event.threadID);
      } catch (error) {
        console.error('Error in owner command:', error);
        api.sendMessage('An error occurred while processing the command.', event.threadID);
      }
    },
    onChat: async function({ api, event }) {
      try {
        const lowerCaseBody = event.body.toLowerCase();

        if (lowerCaseBody === "owner" || lowerCaseBody.startsWith("{p}owner")) {
          await this.onStart({ api, event });
        }
        } catch (error) {
        console.error('Error in onChat function:', error);
      }
    }
  };

/*

To add new video 
1. upload your video on drive
2. after uploading change the video acces to anyone with the link 
3. copy video link
4. go to direct drive link convert website
5. paste that link there and copy direct link
6. paste that link in code 

*/
