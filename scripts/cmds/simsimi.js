module.exports = {
  config: {
    name: "simsimi",
    version: "1.1",
    author: "Fahim_Noob",
    description: "Simsimi Chat",
    role: 0,
    category: "fun",
    guide: {
      en: "{p}{n} <your text>.",
    },
  },
  onStart: async function ({ message, event, args }) {
    if (args.length === 0) {
      message.reply("Please provide a question to ask the AI.");
      return;
    }
    await sendMessage(message, args.join(" "), event, this.config);
  },
  onReply: async function ({ message, event, args }) {
    await sendMessage(message, args.join(" "), event, this.config);
  }
};

const axios = require('axios');

const sendMessage = async (message, question, event, config) => {
  try {
    const encodedQuestion = encodeURIComponent(question);
const ok = 'xyz';
    const response = await axios.get(`https://smfahim.${ok}/simsimi?text=${encodedQuestion}&language=en`);

    if (response.status !== 200) throw new Error('API error');

    const simsimires = response.data.answer;
    message.reply({
      body: `${simsimires}`,
    }, (err, info) => {
      if (err) return console.error(err);
      global.GoatBot.onReply.set(info.messageID, {
        commandName: config.name,
        messageID: info.messageID,
        author: event.senderID
      });
    });
  } catch (error) {
    console.error("Error:", error.message);
    message.reply("Sorry, there was an error processing your request.");
  }
};