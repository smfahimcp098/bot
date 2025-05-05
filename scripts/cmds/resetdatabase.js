const { utils } = global;

module.exports = {
  config: {
    name: "resetdatabase",
    version: "1.0",
    author: "S M Fahim",
    countDown: 5,
    role: 2,
    shortDescription: "Reset all data of this thread",
    longDescription: "Remove or clear all stored data for this thread",
    category: "admin",
    guide: {
      en: "${p}{n}resetdatabase",
    },
  },

  onStart: async function ({ message, event, threadsData }) {
    const threadID = event.threadID;

    try {
      if (typeof threadsData.remove === "function") {
        await threadsData.remove(threadID);
        return message.reply(`✅ Thread ${threadID} removed via remove()`);
      }

      await threadsData.set(threadID, {});
      return message.reply(`✅ Thread ${threadID} cleared via set({})`);
    } catch (err) {
      return message.reply(`❌ Failed to reset thread data: ${err.message}`);
    }
  },

  onChat: async function ({ event, message, threadsData }) {
    if (event.body && event.body.toLowerCase() === "resetdatabase") {
      const threadID = event.threadID;

      try {
        if (typeof threadsData.remove === "function") {
          await threadsData.remove(threadID);
          return message.reply(`✅ Thread ${threadID} removed via remove()`);
        }

        await threadsData.set(threadID, {});
        return message.reply(`✅ Thread ${threadID} cleared via set({})`);
      } catch (err) {
        return message.reply(`❌ Failed to reset thread data: ${err.message}`);
      }
    }
  }
};
