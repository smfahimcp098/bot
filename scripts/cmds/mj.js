const axios = require("axios");
const { getStreamFromURL } = global.utils;
const diptoApi = "https://noobs-api.top/dipto";
module.exports.config = {
  name: "midjourney",
  aliases: ["mj"],
  version: "2.0",
  role: 0, 
  author: "Dipto", 
  description: "MidJourney image generator",
  usePrefix: true,
  guide: "{pn} [prompt]",
  category: "𝗜𝗠𝗔𝗚𝗘 𝗚𝗘𝗡𝗘𝗥𝗔𝗧𝗢𝗥",
  premium: true,
  countDown: 35,
};

module.exports.onReply = async function ({ api, event, message, Reply }) {
  let reply = event?.body?.toLowerCase() || "";
  const { author } = Reply;
  if(author != event.senderID) return;
  if (event.type == "message_reply") {
  try {
  let actionn;  
  if (isNaN(reply)) {
    if(reply == "u1"){
      actionn = Reply.action[0];
    }else if (reply == "u2"){
      actionn = Reply.action[1];
    }else if (reply == "u3"){
      actionn = Reply.action[2];
    }else if (reply == "u4"){
      actionn = Reply.action[3];
    }else if(reply == "v1"){
      actionn = Reply.action[4];
    }else if (reply == "v2"){
      actionn = Reply.action[5];
    }else if (reply == "v3"){
      actionn = Reply.action[6];
    }else if (reply == "v4"){
      actionn = Reply.action[7];
    }else {
     return message.reply("𝐏𝐥𝐞𝐚𝐬𝐞 𝐫𝐞𝐩𝐥𝐲 𝐚 𝐯𝐚𝐥𝐢𝐝 𝐨𝐩𝐭𝐢𝐨𝐧.\n\n𝟏. 𝐔𝟏\n𝟐. 𝐔𝟐\n𝟑. 𝐔𝟑\n𝟒. 𝐔𝟒\n🔄️\n𝟏. 𝐕𝟏\n𝟐. 𝐕𝟐\n𝟑. 𝐕𝟑\n𝟒. 𝐕𝟒");
    }
     const waitMsg2 = await message.reply("𝗪𝗮𝗶𝘁 𝗕𝗯𝘆 <😘");
    const response = await axios.get(`${diptoApi}/midjourneyAction?action=${actionn}&image_id=${Reply.imageID}`)
    message.unsend(await waitMsg2.messageID);
    await api.sendMessage({ 
      body: `✅ | 𝙷𝚎𝚛𝚎'𝚜 𝚈𝚘𝚞𝚛 𝙸𝚖𝚊𝚐𝚎 <😘\n⚫ | 𝐌𝐨𝐫𝐞 𝐀𝐯𝐚𝐥𝐢𝐚𝐛𝐥𝐞 𝐀𝐜𝐭𝐢𝐨𝐧𝐬\n\n𝟏. 𝐩𝐚𝐧_𝐮𝐩\n𝟐. 𝐩𝐚𝐧_𝐥𝐞𝐟𝐭\n𝟑. 𝐩𝐚𝐧_𝐫𝐢𝐠𝐡𝐭\n𝟒. 𝐳𝐨𝐨𝐦_𝐨𝐮𝐭_𝟐𝐱𝟒\n𝟓. 𝐳𝐨𝐨𝐦_𝐨𝐮𝐭_𝟏_𝟓𝐱`,  
      attachment: await getStreamFromURL(response.data.image_url)
    }, event.threadID,  (error, info) => {
  global.GoatBot.onReply.set(info.messageID, {
    commandName: this.config.name,
    type: 'reply',
    messageID: info.messageID,
    author: event.senderID,
    imageID: response.data.image_id,
    action: response.data.actions
  })},event.messageID);
   }
  } catch (error){
    console.error(error.message);
    api.sendMessage(`❎ | 𝗘𝗿𝗿𝗼𝗿: ${error.message}`, event.threadID, event.messageID);
  }
  /////
      if (!isNaN(reply)) {
  const num = parseInt(reply);
  if (num >= 1 && num <= 5) {
    actionn = Reply.action[num - 1];
  } else {
    return message.reply("𝐏𝐥𝐞𝐚𝐬𝐞 𝐫𝐞𝐩𝐥𝐲 𝐚 𝐯𝐚𝐥𝐢𝐝 𝐨𝐩𝐭𝐢𝐨𝐧.\n\n𝟏/𝟐/𝟑/𝟒/𝟓");
    }
    
     const waitMsg2 = await message.reply("𝗪𝗮𝗶𝘁 𝗕𝗯𝘆 <😘");
    try {
    const response = await axios.get(`${diptoApi}/midjourneyAction?action=${actionn}&image_id=${Reply.imageID}`)
    message.unsend(await waitMsg2.messageID);
    await api.sendMessage({ 
      body: `✅ | 𝙷𝚎𝚛𝚎'𝚜 𝚈𝚘𝚞𝚛 𝙸𝚖𝚊𝚐𝚎 <😘`,  
      attachment: await getStreamFromURL(response.data.image_url)
    }, event.threadID,event.messageID);

    } catch (error) {
        console.error(error.message);
        api.sendMessage(`❎ | 𝗘𝗿𝗿𝗼𝗿: ${error.message}`, event.threadID, event.messageID);
      }
     }
    }
}
module.exports.onStart = async function ({ message, api, args, event }) {
  try {
    const dipto = args.join(" ");
    if (!args[0]) {
     return message.reply("❎ | 𝗣𝗹𝗲𝗮𝘀𝗲 𝗽𝗿𝗼𝘃𝗶𝗱𝗲 𝗮 𝗽𝗿𝗼𝗺𝗽𝘁.");
    }
    if (dipto) {
      const waitMsg = await message.reply("𝗪𝗮𝗶𝘁 𝗕𝗯𝘆 <😘");
      const res = await axios.get(`${diptoApi}/midjourney?prompt=${dipto}&key=mjcudi`);
      console.log(res.data);
      message.unsend(await waitMsg.messageID);
      await api.sendMessage({ 
        body: `𝐑𝐞𝐩𝐥𝐲 𝐭𝐨 𝐭𝐡𝐢𝐬 𝐦𝐞𝐬𝐬𝐚𝐠𝐞 𝐰𝐢𝐭𝐡 𝐔𝟏/𝐔𝟐/𝐔𝟑/𝐔𝟒\n🔄️\n𝐕𝟏/𝐕𝟐/𝐕𝟑/𝐕𝟒 𝐭𝐨 𝐠𝐞𝐭 𝐢𝐦𝐚𝐠𝐞.`, 
        attachment: await getStreamFromURL(res.data.image_url) 
      }, event.threadID, (error, info) => {
  global.GoatBot.onReply.set(info.messageID, {
    commandName: this.config.name,
    type: 'reply',
    messageID: info.messageID,
    author: event.senderID,
    imageID: res.data.image_id,
    action: res.data.actions
  })}, event.messageID);
    }
  } catch (error) {
    console.error(error.message);
    api.sendMessage(`❎ | 𝗘𝗿𝗿𝗼𝗿: ${error.message}`, event.threadID, event.messageID);
  }
};
