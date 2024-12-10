const a = require('fs');
const b = require('path');
const c = require('axios');
const { exec: d } = require('child_process');
const e = require('ffmpeg-static');

const f = b.join(__dirname, 'cache');
const g = (prefix) => b.join(f, `${prefix}_${Date.now()}.mp4`);

if (!a.existsSync(f)) a.mkdirSync(f);

module.exports = {
  config: {
    name: "speed",
    version: "1.0",
    author: "Team Calyx",
    shortDescription: "Enhance your video experience by adjusting playback speed.",
    longDescription: "This tool empowers you to control video playback speed with ease. Simply reply to a video message and specify a speed factor between 0.1 and 10 to watch your content at the speed that suits you best.",
    category: "Video Manipulation",
    guide: { en: "{p}speed <factor> - Adjusts video speed by specified factor." }
  },
  onStart: async function ({ message, event, args }) {
    try {
      const { type: h, messageReply: i } = event;
      if (h !== "message_reply" || !i || !i.attachments) {
        return message.reply("❌ || Please reply to a video message to adjust its speed.");
      }

      const [j] = i.attachments;
      if (j.type !== "video") return message.reply("❌ || You must reply to a video message.");

      const k = j.url;
      const l = parseFloat(args[0]);
      if (isNaN(l) || l < 0.1 || l > 10) {
        return message.reply("❌ || Speed factor must be a number between 0.1 and 10.");
      }

      const m = g('video');
      const n = g('speed');

      const o = await c({ url: k, method: 'GET', responseType: 'stream' });
      const p = a.createWriteStream(m);
      o.data.pipe(p);

      await new Promise((resolve, reject) => {
        p.on('finish', resolve);
        p.on('error', reject);
      });

      const q = ['-i', m, '-filter:v', `setpts=${1 / l}*PTS`, '-filter:a', `atempo=${l}`, n];

      d(`${e} ${q.join(' ')}`, async (error) => {
        if (error) {
          console.error("FFmpeg error:", error);
          return message.reply("❌ || Error adjusting video speed.");
        }

        message.reply({ attachment: a.createReadStream(n) })
          .then(() => {
            a.unlinkSync(m);
            a.unlinkSync(n);
          })
          .catch((sendError) => {
            console.error("Error sending video:", sendError);
            message.reply("❌ || An error occurred while sending the adjusted video.");
          });
      });

    } catch (error) {
      console.error("Error:", error);
      message.reply("❌ || An error occurred during processing.");
    }
  }
};