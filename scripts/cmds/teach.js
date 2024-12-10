const axios = require("axios");

module.exports = {
  config: {
    name: "teach",
    aliases: ["simteach"],
    version: "1.0",
    author: "JARiF",
    countDown: 5,
    role: 2,
    shortDescription: {
      en: "teach sim"
    },
    longDescription: {
      en: "teach sim"
    },
    category: "owner",
    guide:{
      en: "{p}teach your ask | my answer "
    }
  },
  onStart: async function ({ api, event, args }) {
    const { messageID, threadID, senderID, body } = event;
    const tid = threadID,
          mid = messageID;
    const content = args.join(" ").split("=>").map(item => item.trim());
    const ask = encodeURIComponent(content[0]);
    const ans = encodeURIComponent(content[1]);
    if (!args[0]) return api.sendMessage("Use ${prefix}quesion => answer", tid, mid);
    const res = await axios.get(`https://simsimi.fun/api/v2/?mode=teach&lang=en&message=${ask}&answer=${ans}`);
    const responseMessage = res.data.success;
    api.sendMessage(responseMessage, tid, mid);
  }
};