module.exports = {
  config: {
    name: 'edit',
    version: '1.0',
    author: 'Fahim',
    category: 'admin',
  },
  onStart: async function ({ message, args, api, event }) {
    try {
      const newMessage = args.join(' ');

      if (!newMessage) {
        return message.reply('Add message message.');
      }
 api.editMessage(newMessage,event.messageReply.messageID);

    } catch (error) {
      console.error(error);
      message.reply('An error occurred.');
    }
  },
};