const { get } = require('axios');
const fs = require('fs');

let url = "https://ai-tools.replit.app";
let f = __dirname + '/cache/render3d.png';

module.exports = {
  config: {
    name: "create",
    aliases: [],
    version: "1.0",
    author: "ROLExBin Team",
    countDown: 5,
    role: 0,
    shortDescription: "Generate image on Render 3D",
    longDescription: "",
    category: "image",
    guide: "{pn}"
  },

  onStart: async function ({ api, event, args }) {
    function r(msg) {
      api.sendMessage(msg, event.threadID, event.messageID);
    }

    if (!args[0]) return r('Missing prompt!');

    const a = args.join(" ");
    if (!a) return r('Missing prompt!');
    try {
      const d = (await get(url + '/render?prompt=' + a, {
        responseType: 'arraybuffer'
      })).data;
      fs.writeFileSync(f, Buffer.from(d, "utf8"));
      return r({ attachment: fs.createReadStream(f, () => fs.unlinkSync(f)) });
    } catch (e) {
      return r(e.message);
    }
  }
};