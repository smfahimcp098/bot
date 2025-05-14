const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");

module.exports = {
  config: {
    name: "approve",
    version: "2.1",
    author: "Modified by ChatGPT",
    countDown: 5,
    role: 2,
    shortDescription: "Auto thread approve/remove",
    category: "admin",
    guide: {
      en: "{pn} [add/remove] - Add or remove current thread from whitelist"
    }
  },

  langs: {
    en: {
      threadAdded: "✅ | Current thread added to whiteListThreadIds.",
      threadRemoved: "✅ | Current thread removed from whiteListThreadIds.",
      threadExist: "⚠ | This thread is already in whiteListThreadIds.",
      threadNotExist: "⚠ | This thread is not in whiteListThreadIds.",
    }
  },

  onStart: async function ({ message, args, event, getLang }) {
    const tid = event.threadID;

    switch (args[0]) {
      case "add":
      case "-a":
      case "threadadd":
      case "-ta": {
        if (config.whiteListModeThread.whiteListThreadIds.includes(tid))
          return message.reply(getLang("threadExist"));

        config.whiteListModeThread.whiteListThreadIds.push(tid);
        writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
        return message.reply(getLang("threadAdded"));
      }

      case "remove":
      case "-r":
      case "threadremove":
      case "-tr": {
        if (!config.whiteListModeThread.whiteListThreadIds.includes(tid))
          return message.reply(getLang("threadNotExist"));

        config.whiteListModeThread.whiteListThreadIds = config.whiteListModeThread.whiteListThreadIds.filter(id => id !== tid);
        writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
        return message.reply(getLang("threadRemoved"));
      }

      default:
        return message.reply("Use: approve add/remove");
    }
  }
};
