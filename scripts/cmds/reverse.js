const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { exec } = require('child_process');
const ffmpeg = require('ffmpeg-static');

const cacheFolder = path.join(__dirname, 'cache');
if (!fs.existsSync(cacheFolder)) {
  fs.mkdirSync(cacheFolder);
}

module.exports = {
  config: {
    name: "reverse",
    version: "1.0",
    author: "Team Calyx",
    shortDescription: "Reverse a video",
    longDescription: "Reverse a video for fun or creative effects.",
    category: "utility",
    guide: {
      en: "{pn}reverse"
    }
  },

  onStart: async function ({ message, event, api, args }) {
    try {
      if (event.type !== "message_reply") {
        return message.reply("❌ | Please reply to a video to reverse it.");
      }

      const attachment = event.messageReply.attachments;
      if (!attachment || attachment.length !== 1 || attachment[0].type !== "video") {
        return message.reply("❌ | Please reply to a single video file.");
      }

      const videoUrl = attachment[0].url;
      const userVideoPath = path.join(cacheFolder, `video_${Date.now()}.mp4`);
      const reversedVideoPath = path.join(cacheFolder, `reversed_${Date.now()}.mp4`);

      const responseVideo = await axios({
        url: videoUrl,
        method: 'GET',
        responseType: 'stream'
      });
      const writerVideo = fs.createWriteStream(userVideoPath);
      responseVideo.data.pipe(writerVideo);

      await new Promise((resolve, reject) => {
        writerVideo.on('finish', resolve);
        writerVideo.on('error', reject);
      });

      const ffmpegCommand = [
        '-i', userVideoPath,
        '-vf', 'reverse',
        reversedVideoPath
      ];

      exec(`${ffmpeg} ${ffmpegCommand.join(' ')}`, async (error, stdout, stderr) => {
        if (error) {
          console.error("FFmpeg error:", error);
          return message.reply("❌ | An error occurred while reversing the video.");
        }

        setTimeout(async () => {
          await message.reply({
            body: "✅ | Here’s your reversed video! Enjoy! 🎥",
            attachment: fs.createReadStream(reversedVideoPath)
          }).then(() => {
            fs.unlinkSync(userVideoPath);
            fs.unlinkSync(reversedVideoPath);
          }).catch((sendError) => {
            console.error("Error sending video:", sendError);
            message.reply("❌ | An error occurred while sending the video.");
          });
        }, 2000);

      });

    } catch (error) {
      console.error("Error:", error);
      message.reply("❌ | An unexpected error occurred.");
    }
  }
};
