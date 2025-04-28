const axios = require("axios");
const { getStreamFromURL } = global.utils;

module.exports.config = {
  name: "midjourney",
  aliases: ["mj"],
  version: "2.0",
  role: 0,
  author: "Dipto",
  description: "MidJourney image generator",
  usePrefix: true,
  guide: "{pn} [prompt]",
  category: "ai",
  countDown: 35,
};

module.exports.onReply = async function({ api, event, message, Reply }) {
  let reply = event?.body?.toLowerCase() || "";
  if (Reply.author != event.senderID) return;
  if (event.type !== "message_reply") return;
  try {
    let actionn;
    if (isNaN(reply)) {
      const map = { u1: 0, u2: 1, u3: 2, u4: 3, v1: 4, v2: 5, v3: 6, v4: 7 };
      if (!Object.prototype.hasOwnProperty.call(map, reply)) {
        return message.reply("𝐏𝐥𝐞𝐚𝐬𝐞 𝐫𝐞𝐩𝐥𝐲 𝐚 𝐯𝐚𝐥𝐢𝐝 𝐨𝐩𝐭𝐢𝐨𝐧.\n\n𝟏. U1\n𝟐. U2\n𝟑. U3\n𝟒. U4\n🔄️\n𝟏. V1\n𝟐. V2\n𝟑. V3\n𝟒. V4");
      }
      actionn = Reply.action[map[reply]];
    } else {
      const num = parseInt(reply);
      if (num < 1 || num > Reply.action.length) {
        return message.reply("𝐏𝐥𝐞𝐚𝐬𝐞 𝐫𝐞𝐩𝐥𝐲 𝐚 𝐯𝐚𝐥𝐢𝐝 𝐨𝐩𝐭𝐢𝐨𝐧.\n\n1/2/3/4/5");
      }
      actionn = Reply.action[num - 1];
    }
    const waitMsg2 = await message.reply("𝗪𝗮𝗶𝘁 𝗕𝗯𝘆 <😘");
    const res = await axios.get(`https://noobs-api.top/dipto/midjourneyAction?action=${actionn}&image_id=${Reply.imageID}`);
    const imageUrl = res.data.image_url || res.data.url;
    if (typeof imageUrl !== "string") {
      return message.reply("❎ | Invalid image URL received from API.");
    }
    await message.unsend(waitMsg2.messageID);
    const stream = await getStreamFromURL(imageUrl);
    await api.sendMessage({
      body: `✅ | 𝙷𝚎𝚛𝚎'𝚜 𝚈𝚘𝚞𝚛 𝙸𝚖𝚊𝚐𝚎 <😘\n⚫ | 𝐌𝐨𝐫𝐞 𝐀𝐯𝐚𝐥𝐢𝐚𝐛𝐥𝐞 𝐀𝐜𝐭𝐢𝐨𝐧𝐬\n\n𝟏. 𝐩𝐚𝐧_𝐮𝗉\n𝟐. 𝐩𝐚𝐧_𝐥𝗒𝐟𝐭\n𝟑. 𝐩𝐚𝐧_𝐫𝐢𝗴𝐡𝐭\n𝟒. 𝐳𝐨𝐨𝐦_𝐨𝗎𝐭_𝟐𝐱𝟒\n𝟓. 𝐳𝐨𝐨𝐦_𝐨𝗎𝐭_𝟏_𝟓𝐱`,
      attachment: stream
    }, event.threadID, (error, info) => {
      global.GoatBot.onReply.set(info.messageID, {
        commandName: this.config.name,
        type: "reply",
        messageID: info.messageID,
        author: event.senderID,
        imageID: res.data.image_id,
        action: res.data.actions
      });
    }, event.messageID);
  } catch (error) {
    api.sendMessage(`❎ | 𝗘𝗿𝗿𝗼𝗿: ${error.message}`, event.threadID, event.messageID);
  }
};

module.exports.onStart = async function({ message, api, args, event }) {
  try {
    const dipto = args.join(" ");
    if (!dipto) return message.reply("❎ | 𝗣𝗹𝗲𝗮𝘀𝗲 𝗽𝗿𝗼𝘃𝗶𝗱𝗲 𝗮 𝗽𝗿𝗼𝗺𝗽𝘁.");
    const waitMsg = await message.reply("𝗪𝗮𝗶𝘁 𝗕𝗯𝘆 <😘");
    const res = await axios.get(`https://noobs-api.top/dipto/midjourney?prompt=${encodeURIComponent(dipto)}&key=mjcudi`);
    const imageUrl = res.data.image_url || res.data.url;
    if (typeof imageUrl !== "string") {
      return message.reply("❎ | Invalid image URL received from API.");
    }
    await message.unsend(waitMsg.messageID);
    await api.sendMessage({
      body: `𝐑𝐞𝐩𝐥𝐲 𝐭𝐨 𝐭𝐡𝐢𝐬 𝐦𝐞𝐬𝐬𝐚𝐠𝐞 𝐰𝐢𝐭𝐡 𝐔𝟏/𝐔𝟐/𝐔𝟑/𝐔𝟒\n🔄️\n𝐕𝟏/𝐕𝟐/𝐕𝟑/𝐕𝟒 𝐭𝐨 𝐠𝐞𝐭 𝐢𝐦𝐚𝐠𝐞.`,
      attachment: await getStreamFromURL(imageUrl)
    }, event.threadID, (error, info) => {
      global.GoatBot.onReply.set(info.messageID, {
        commandName: this.config.name,
        type: "reply",
        messageID: info.messageID,
        author: event.senderID,
        imageID: res.data.image_id,
        action: res.data.actions
      });
    }, event.messageID);
  } catch (error) {
    api.sendMessage(`❎ | 𝗘𝗿𝗿𝗼𝗿: ${error.message}`, event.threadID, event.messageID);
  }
};
