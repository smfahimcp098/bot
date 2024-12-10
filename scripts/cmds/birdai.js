const axios = require('axios');
const { getStreamFromURL } = global.utils;

module.exports = {
  config: {
    name: "bard",
    version: "1.2",
    author: "Rishad",
    countDown: 5,
    role: 0,
    shortDescription: "Chat With Bard Ai",
    longDescription: "Google Bard is a natural language generation model that can generate poetry and rhyming verse. It can also show you pictures on your request.",
    category: "ai",
    guide: {
      en: "â”‚\n{pn} <query>\n{pn}<clear> or reply clear for delete your\nconversation\n(you can reply to continue chat )"
    },
  },
  onStart: async function ({ message, event, args, commandName }) {
    const UID = event.senderID;
    const query = args.join(' ');
    const prompt = encodeURIComponent(query);
    const imageUrl = await uploadImageToImgur(extractImageUrlFromMessage(event));

    try {
      const apiUrlWithQuery = `https://for-devs.onrender.com/api/bard?query=${prompt}&UID=${UID}&apikey=fuck&attachment=${encodeURIComponent(imageUrl)}`;
      const res = await axios.get(apiUrlWithQuery);
      const { response } = res.data;

      let formSend = { body: response.message };

      if (response.imageUrls.length > 0) {
        const streams = [];
        for (let i = 0; i < Math.min(6, response.imageUrls.length); i++) {
          streams.push(await getStreamFromURL(response.imageUrls[i]));
        }
        formSend.attachment = streams;
      }

      message.reply(formSend, (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName,
          author: event.senderID
        });
      });
    } catch (error) {
      message.reply(error.message);
    }
  },
  onReply: async function ({ message, event, Reply }) {
    if (event.senderID != Reply.author) return message.reply('🐸 Who are you nega ?');

    const imageUrl = await uploadImageToImgur(extractImageUrlFromMessage(event));

    if (!imageUrl && event.messageReply.attachments[0]?.type !== "photo") {
      await BARD(encodeURIComponent(event.body), event.senderID, message, Reply.commandName, event);
    } else if (event.messageReply.attachments[0]?.type === "photo") {
      await BARD(encodeURIComponent(event.body), event.senderID, message, Reply.commandName, event, imageUrl);
    } else {
      return message.reply('Please reply with an image.');
    }
  }
};

async function BARD(prompt, UID, message, commandName, event, imageUrl) {
  try {
    const apiUrlWithQuery = `https://for-devs.onrender.com/api/bard?query=${prompt}&UID=${UID}&apikey=fuck&attachment=${encodeURIComponent(imageUrl)}`;
    const res = await axios.get(apiUrlWithQuery);
    const { response } = res.data;

    let formSend = { body: response.message };

    if (response.imageUrls.length > 0) {
      const streams = [];
      for (let i = 0; i < Math.min(6, response.imageUrls.length); i++) {
        streams.push(await getStreamFromURL(response.imageUrls[i]));
      }
      formSend.attachment = streams;
    }

    message.reply(formSend, (err, info) => {
      global.GoatBot.onReply.set(info.messageID, {
        commandName,
        author: event.senderID
      });
    });
  } catch (error) {
    message.reply(error.message);
  }
}

async function uploadImageToImgur(imageUrl) {
  try {
    if (!imageUrl) {
      return null;
    }

    const apiUrl = `https://for-devs.onrender.com/api/imgur?apikey=fuck&link=${encodeURIComponent(imageUrl)}`;
    const res = await axios.get(apiUrl);
    const { uploaded } = res.data;

    if (uploaded.status === "success") {
      return uploaded.url;
    } else {
      throw new Error("Imgur upload failed");
    }
  } catch (error) {
    throw new Error("Imgur upload failed");
  }
}

function extractImageUrlFromMessage(event) {
  if (event.type === "message_reply" && event.messageReply.attachments[0]?.type === "photo") {
    return event.messageReply.attachments[0]?.url;
  }
  return null;
}