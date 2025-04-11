module.exports = {
  config: {
    name: "jamba",
    version: "1.1",
    author: "Team Calyx",
    description: "Ask AI a question",
    role: 0,
    category: "ai",
    guide: {
      en: "{p}{n} <question> to ask AI a question. Use {p}ai21 clear to clear your history. You can add a message after 'clear' to receive a response.",
    },
  },
  onStart: async function ({ message, event, args }) {
    if (args.length === 0) {
      message.reply("Please provide a question to ask the AI.");
      return;
    }

    if (args[0].toLowerCase() === 'clear') {
      if (args.length === 1) {
        clearUserHistory(event.senderID);
        message.reply("Your conversation history has been cleared.");
      } else {
        message.reply(`You said: "${args.slice(1).join(' ')}"`);
      }
      return;
    }

    await sendMessage(message, args.join(" "), event, this.config);
  },
  onReply: async function ({ message, event, args }) {
    if (args.length === 0) {
      message.reply("Please provide a question to ask the AI.");
      return;
    }

    if (args[0].toLowerCase() === 'clear') {
      if (args.length === 1) {
        clearUserHistory(event.senderID);
        message.reply("Your conversation history has been cleared.");
      } else {
        message.reply(`You said: "${args.slice(1).join(' ')}"`);
      }
      return;
    }

    await sendMessage(message, args.join(" "), event, this.config);
  }
};

const axios = require('axios');
const conversationHistory = {};

const getUserHistory = (userId) => {
  if (!conversationHistory[userId]) {
    conversationHistory[userId] = [];
  }
  return conversationHistory[userId];
};

const clearUserHistory = (userId) => {
  if (conversationHistory[userId]) {
    delete conversationHistory[userId];
  }
};

const sendMessage = async (message, question, event, config) => {
  try {
    const userId = event.senderID;
    const TOKEN = 'Bearer bpEElglvEWoWbK0OvqyCC2VEZB3EJ4iv';

    const userHistory = getUserHistory(userId);
    userHistory.push({ role: "user", content: question });

    const payload = {
      messages: userHistory,
      n: 1,
      max_tokens: 2048,
      model: "jamba-1.5-large",
      stream: true
    };

    const response = await axios.post(
      'https://api.ai21.com/studio/v1/chat/completions',
      payload,
      {
        headers: {
          'accept': 'application/json, text/plain, */*',
          'accept-language': 'en-US,en;q=0.9',
          'authorization': TOKEN,
          'content-type': 'application/json',
          'origin': 'https://studio.ai21.com',
          'referer': 'https://studio.ai21.com/',
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
        },
        responseType: 'stream',
      }
    );

    let combinedContent = '';

    response.data.on('data', chunk => {
      const str = chunk.toString();
      const match = str.match(/data:\s*(\{.*?\})\s*$/gm);

      if (match) {
        match.forEach(item => {
          const parsedItem = JSON.parse(item.replace('data: ', '').trim());

          if (parsedItem.choices && Array.isArray(parsedItem.choices)) {
            parsedItem.choices.forEach(choice => {
              if (choice.delta && choice.delta.content) {
                combinedContent += choice.delta.content;
              }
            });
          }
        });
      }
    });

    response.data.on('end', () => {
      userHistory.push({ role: "assistant", content: combinedContent });

      message.reply({
        body: `${combinedContent}`,
      }, (err, info) => {
        if (err) return console.error(err);
        global.GoatBot.onReply.set(info.messageID, {
          commandName: config.name,
          messageID: info.messageID,
          author: event.senderID
        });
      });
    });

  } catch (error) {
    console.error("Error:", error.message);
    message.reply("Sorry, there was an error processing your request.");
  }
};
