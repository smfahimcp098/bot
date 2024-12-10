const axios = require("axios");

module.exports = {
  config: {
    name: "bard",
    version: "1.0",
    author: "Samir",
    countDown: 5,
    role: 0,
    category: "Bard"
  },
  onStart: async function({ message, event, args, commandName }) {
    const prompt = args.join(' ');

    try {
      const response = await axios.get(`https://www.samirxpikachu.run.place/gemini-apu?text=${encodeURIComponent(prompt)}&cookies=g.a000pAjfCSxaGzWv57f6MDmckX4G9uorq_w-yPJ7iwkjTny0OOEpIETxiko5lq98kJitCCXfFgACgYKASoSARISFQHGX2MiPcW2WPZnEbh96mXRSS-OFxoVAUF8yKrj7DuqZwFE13Jg0UI_eRtm0076`);

      if (response.data) {
        const answer = response.data.text;
        const attachments = [];

        if (response.data.images && response.data.images.length > 0) {
          for (const imageUrl of response.data.images) {
            const attachment = await global.utils.getStreamFromURL(imageUrl);
            attachments.push(attachment);
          }
        }

        const messageOptions = {
          body: answer,
          ...(attachments.length > 0 && { attachment: attachments })
        };

        message.reply(messageOptions, (err, info) => {
          global.GoatBot.onReply.set(info.messageID, {
            commandName,
            messageID: info.messageID,
            author: event.senderID
          });
        });
      }

    } catch (error) {
      console.error("Error:", error.message);
    }
  },

  onReply: async function({ message, event, Reply, args }) {
    let { author, commandName } = Reply;
    if (event.senderID != author) return;
    const prompt = args.join(' ');
   
    try {
      const response = await axios.get(`https://www.samirxpikachu.run.place/gemini-apu?text=${encodeURIComponent(prompt)}&cookies=g.a000pAjfCSxaGzWv57f6MDmckX4G9uorq_w-yPJ7iwkjTny0OOEpIETxiko5lq98kJitCCXfFgACgYKASoSARISFQHGX2MiPcW2WPZnEbh96mXRSS-OFxoVAUF8yKrj7DuqZwFE13Jg0UI_eRtm0076`);

      if (response.data) {
        const answer = response.data.text;
        const attachments = [];

        if (response.data.images && response.data.images.length > 0) {
          for (const imageUrl of response.data.images) {
            const attachment = await global.utils.getStreamFromURL(imageUrl);
            attachments.push(attachment);
          }
        }

        const messageOptions = {
          body: answer,
          ...(attachments.length > 0 && { attachment: attachments })
        };

        message.reply(messageOptions, (err, info) => {
          global.GoatBot.onReply.set(info.messageID, {
            commandName,
            messageID: info.messageID,
            author: event.senderID
          });
        });
      }

    } catch (error) {
      console.error("Error:", error.message);
    }
  }
};