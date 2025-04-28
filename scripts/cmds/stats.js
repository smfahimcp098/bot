const os = require('os');
const fs = require("fs-extra");
const moment = require('moment');

module.exports = {
  config: {
    name: "stats",
    aliases: [],
    version: "1.0",
    author: "Team Calyx",
    countDown: 5,
    role: 0,
    shortDescription: "Show bot statistics",
    longDescription: "Show the statistics of the bot",
    category: "utility",
    guide: {
      en: "{pn}"
    }
  },

  langs: {
    en: {
      uptime: "⚡|Uptime:", 
      os: "💻|Operating System:", 
      storage: "📦|Total Storage:", 
      totalMemory: "💾|Total Memory:", 
      freeMemory: "🗑|Free Memory:",     
      cpuUsage: "🧠|CPU Usage:",
      users: "👥|Total Users:", 
      groups: "💬|Total Groups:", 
      mediaBan: "🚫|Media Ban Status:",
      mediaBanChecking: "⏳|Checking Media Ban...", 
      mediaBanFalse: "No", 
      mediaBanTrue: "Yes", 
      error: "❌ An error occurred while fetching the statistics." 
    },
  },

  onStart: async function({ api, message, event, usersData, threadsData, getLang }) {
    try {
        const uptime = process.uptime();
        const days = Math.floor(uptime / (3600 * 24));
        const hours = Math.floor((uptime % (3600 * 24)) / 3600);
        const mins = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
        const totalMemory = `${Math.round(os.totalmem() / (1024 * 1024 * 1024))} GB`;
        const uptimeString = `${days} days, ${hours} hours, ${mins} minutes, and ${seconds} seconds`;
        const totalUsers = await usersData.getAll().then(data => data.length);
        const threadList = await api.getThreadList(100, null, ["INBOX"]);
        const totalGroups = threadList.filter(thread => thread.isGroup).length;
        const platform = os.platform();
        const totalMem = os.totalmem(); 
        const freeMem = os.freemem(); 

        // Media Ban Testing 
        const testImage = 'https://images.prodia.xyz/df0b8a95-c47f-4e66-be89-ce699359ad64.png';
        const testGroupID = "25761061040175905"; 

        let mediaBanStatus = getLang("mediaBanChecking"); 

        api.sendMessage({ 
            body: "", 
            attachment: await global.utils.getStreamFromURL(testImage) 
        }, testGroupID, async (err, info) => {
          if (err) {
              mediaBanStatus = getLang("mediaBanTrue"); // "Yes"
          } else {
              mediaBanStatus = getLang("mediaBanFalse"); // "No"
              api.unsendMessage(info.messageID); 
          }

          const response = 
            getLang("uptime") + " " + uptimeString + "\n" +
            getLang("os") + " " + platform + " " + os.release() + " (" + os.arch() + ")\n" +
            getLang("cpuUsage") + " " + os.loadavg()[0].toFixed(2) + "\n" +
            getLang("totalMemory") + " " + (totalMem / (1024 ** 3)).toFixed(2) + " GB\n" +
            getLang("freeMemory") + " " + (freeMem / (1024 ** 3)).toFixed(2) + " GB\n" +
            getLang("storage") + " " + totalMemory + "\n" +
            getLang("users") + " " + totalUsers + "\n" +
            getLang("groups") + " " + totalGroups + "\n" +
            getLang("mediaBan") + " " + mediaBanStatus; 

          message.reply(response);
        }); 

    } catch (error) {
      console.error(error);
      message.reply(getLang("error")); 
    }
  } 
};
