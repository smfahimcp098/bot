const axios = require('axios');

module.exports = {
  config: {
    name: "autoai",
    version: "1.1",
    author: "Fahim_Noob",
    description: "Ask AI a question",
    role: 0,
    category: "ai",
    guide: {
      en: "{p}{n} <question> to ask AI a question.",
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

const sendMessage = async (message, question, event, config) => {
  try {
    const encodedQuestion = encodeURIComponent(question);
    const response = await axios.get(`https://www.noobs-api.000.pe/dipto/gemini?prompt=${encodedQuestion}`);

    if (response.status !== 200) throw new Error('API error');

    const aiResponse = response.data.dipto;

    message.reply({
      body: `${aiResponse}`,
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