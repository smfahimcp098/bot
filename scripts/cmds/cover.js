const o = 'xyz'

module.exports = {
  config: {
    name: "cover",
    version: "1.0",
    author: "Fahim_Noob",
    countDown: 5,
    role: 0,
    shortDescription: "Create fb Banner",
    longDescription: "Create fb Banner",
    category: "image",
    guide: {
      en: "{p}{n} Name, Color, Address, Email, Subname, SDT",
    }
  },

  onStart: async function ({ message, args, event, api }) {
    const info = args.join(" ");
    if (!info) {
      return message.reply("Please enter in the format:\n/cover Name, Color, Address, Email, Subname, SDT");
    } else {
      const msg = info.split(", ");
      if (msg.length < 6) {
        return message.reply("Please provide all required fields: Name, Color, Address, Email, Subname, SDT");
      }

      const [name, color, address, email, subname, sdt] = msg;

      const uid = event.senderID;

      await message.reply("Processing your cover...");

      const imgURL = `https://www.smfahim.${o}/fbcover?name=${encodeURIComponent(name)}&color=${encodeURIComponent(color)}&address=${encodeURIComponent(address)}&email=${encodeURIComponent(email)}&subname=${encodeURIComponent(subname)}&uid=${encodeURIComponent(uid)}&sdt=${encodeURIComponent(sdt)}`;

      try {
        const responseStream = await global.utils.getStreamFromURL(imgURL);
        const form = {
          body: "Here is your cover 🙂❣️",
          attachment: [responseStream]
        };
        message.reply(form);
      } catch (error) {
        console.error("Error retrieving image:", error);
        message.reply("Error retrieving image. Please try again later.");
        api.setMessageReaction("❌", event.messageID, () => {}, true);
      }
    }
  }
};