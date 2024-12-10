
const moment = require('moment-timezone');

module.exports = {
  config: {
    name: "uptime",
    aliases: ["upt","ms"],
    version: "1.0",
    author: "Fahim & Upol - Modified by Sahadat", 
    role: 0,
    shortDescription: {
      en: ""
    },
    longDescription: {
      en: ""
    },
    category: "system",
    guide: {
      en: ""
    }
  },
  onStart: async function ({ api, event, args }) {
    const timeStamp = Date.now();
    let send = await api.sendMessage(" ⏳ |  Please wait for checking ping", event.threadID);

    const ping = Date.now() - timeStamp;

    let pingStatus = " 🟢 | Very Good ";
    if (ping > 350) {
      pingStatus = " 🟩 | Good";
    }
    if (ping > 500) {
      pingStatus = " ✅ | Medium..!!";
    }
    if (ping > 1000) {
      pingStatus = " ⭕ | Bad";
    }
    if (ping > 1500) {
      pingStatus = "🔴 | Very Bad";
    }
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    let currentDate = moment().tz('Asia/Dhaka').format('YYYY-MM-DD hh:mm:ss A'); // Format in 12-hour with AM/PM
    const uptimeString = `${hours}h ${minutes}m ${seconds}s`;

    await api.sendMessage(`Malta Ai Bot Current Speed: ${ping} ms.\nSpeed Status: ${pingStatus}\n\nUptime: ${uptimeString}\nDate: ${currentDate}`, event.threadID);
  }
};
