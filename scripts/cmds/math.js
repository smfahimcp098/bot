module.exports = {
  config: {
    name: 'math',
    ailases: ['calc', 'calculate'],
    version: 'No Need',
    author: 'UPoL The MiMis MoMo ☺️🌸',
    category: 'utility',
    longDescription: {
      en: 'Calculate math expressions.'
    }
  },
  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const expression = args.join(' ');
    if (!expression) {
      return api.sendMessage('Please provide a math expression to calculate.', threadID, messageID);
    }
    try {
      const result = eval(expression);
      api.sendMessage(`Result: ${result}`, threadID, messageID);
    } catch (error) {
      api.sendMessage('Invalid math expression.', threadID, messageID);
    }
  }
};