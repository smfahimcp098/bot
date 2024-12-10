const axios = require("axios");
const { getStreamFromURL } = global.utils;

module.exports = {
  config: {
    name: "ramadan",
    version: "1.0",
    author: "SiAM",
    countDown: 5,
    role: 0,
    shortDescription: "",
    longDescription: "This command provides Ramadan timings information for a given city.",
    category: "ai",
    guide: { en:"{pn} district/state "},
  },

  onStart: async function ({ api, args, message, event}) {
    try {
      if (args.length === 0) {
        message.reply("Please provide a city/state name.");
        return;
      }

      const botName = 'Your bot Name'; // add your bot name to show it in canvas image';

      const cityName = args.join(" ");
      message.reaction("⏰", event.messageID);
      const apiUrl = `https://connect-simoai.onrender.com/tools/ramadan?city=${encodeURIComponent(cityName)}&botName=${encodeURIComponent(botName)}`;
      const response = await axios.get(apiUrl);

      if (!response.data.city) {
        message.reply("City or state not found. Please check the spelling and try again.");
        return;
      }

      const {
        city,
        localTime,
        today,
        tomorrow,
        canvas_img
      } = response.data;

      const ramadanInfo = "🌙 Ramadan Timings 🕌\n" +
        "❏ City: " + city + "\n" +
        "❏ Date: " + today.date + "\n" +
        "❏ Current Time: " + localTime + "\n\n" +
        "Today's:\n" +
        "❏ Sahr: " + today.sahr + "\n" +
        "❏ Iftar: " + today.iftar + "\n\n" +
        "Tomorrow:\n" +
        "❏ Date: " + tomorrow.date + "\n" +
        "❏ Sahr: " + tomorrow.sahr + "\n" +
        "❏ Iftar: " + tomorrow.iftar + "\n\n" +
        "❏ Note: 1 minute preventative difference in Sehri (-1 min) & Iftar (+1 min)";

      const stream = await getStreamFromURL(canvas_img);

      message.reply({
        body: ramadanInfo,
        attachment: stream
      });
      await message.reaction("✅", event.messageID);



    } catch (error) {
      console.error(error);
      message.reply("Error fetching Ramadan timings.");
    }
  }
};