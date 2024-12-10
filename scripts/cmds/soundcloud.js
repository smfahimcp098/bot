module.exports = {
  config: {
    name: "sc",
    aliases: ["soundcloud"],
    version: "1.0",
    author: "Fahim_Noob",
    countDown: 5,
    role: 0,
    description: {
      en: "Plays a music track from the given URL."
    },
    category: "music",
    guide: {
      en: "Type the command followed by the song name to play the music."
    }
  },
  langs: {
    en: {
      syntaxError: "Please provide a valid song name!"
    }
  },

  onStart: async function ({ message, event, args, getLang, api }) {
    const songName = args.join(" ");
    if (!songName) return message.reply(getLang('syntaxError'));

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      const puti = 'xyz';
      const songUrl = `https://smfahim.${puti}/soundcloud?search=${encodeURIComponent(songName)}`;

      await message.reply({
        body: `Playing: ${songName}`,
        attachment: await global.utils.getStreamFromURL(songUrl)
      });

      api.setMessageReaction("✅", event.messageID, () => {}, true);

    } catch (error) {
      message.reply("Error occurred while fetching the song.");
    }
  }
};