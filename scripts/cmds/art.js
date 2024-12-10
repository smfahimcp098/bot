const axios = require("axios");
const fs = require("fs");

const stylesList = {
    '1': 'Anime',
    '2': 'Comic Book',
    '3': 'Studio Ghibli',
    '4': 'Clay',
    '5': 'Disney',
    '6': 'Webtoon',
    '7': 'Art',
    '8': 'Digital Art',
    '9': 'Pixel Art',
    '10': 'Renaissance',
    '11': 'Oil Painting',
    '12': 'Impressionist',
    '13': 'Watercolor',
    '14': 'Sketch',
    '15': 'Line Drawing',
    '16': 'Caricature',
    '17': 'Painting',
    '18': 'Vector Art',
    '19': 'Monet',
    '20': 'Van Gogh',
    '21': 'Ilustration',
    '22': 'Zelda',
    '23': 'PS2',
    '24': 'Minecraft',
    '25': 'Manga',
    '26': 'GTA',
    '27': 'Goth',
    '28': 'Sims',
    '29': 'Fallout',
    '30': 'MHA',
    '31': 'Mortal Kombat',
    '32': 'One Piece',
    '33': 'Naruto',
    '34': 'Christmas',
    '35': 'Thanksgiving',
    '36': 'New Year',
    '37': 'Halloween',
    '38': 'Superhero',
    '39': 'Avatar',
    '40': 'Emoji',
    '41': 'Royal Portrait',
    '42': 'Vintage',
    '43': 'Simpsons',
    '44': 'Bridgerton',
    '45': 'Barbie',
    '46': 'Wednesday Addams',
    '47': 'Tim Burton',
    '48': 'Vampire',
    '49': 'Witch',
    '50': 'Zombie',
    '51': 'Lego',
    '52': 'Wonder Woman',
    '53': 'Jojo',
    '54': 'Grinch',
    '55': 'Ghost',
    '56': 'The Last Of Us',
    '57': 'Demon Slayer',
    '58': 'Viking',
    '59': 'Spiderman',
    '60': 'Baby',
    '61': 'Aging',
    '62': 'Fat Filter',
    '63': 'Skinny',
    '64': '1930',
    '65': '1970',
    '66': '1980',
    '67': 'Yearbook',
    '68': 'Boondocks',
    '69': 'Fitness',
    '70': 'Lookism',
    '71': 'Korean',
    '72': 'Japanese',
    '73': 'Chinese',
    '74': 'Playboy Bunny',
    '75': 'Vampire Queen',
    '76': 'Zombie Bride',
    '77': 'Zombie Groom',
    '78': 'Skeleton Queen',
    '79': 'Skeleton King',
    '80': 'Creepy Doll',
    '81': 'Cyborg'
};

module.exports = {
  config: {
    name: "art",
    aliases: [],
    version: "1.3",
    role: 0,
    author: "Team Calyx",
    countDown: 5,
    longDescription: "Convert images into anime-style artwork with various styles (1 to 81).",
    category: "image",
    guide: {
      en: `Available styles:\n${Object.entries(stylesList).map(([key, value]) => `${key}: ${value}`).join("\n")}\n\nUsage:\nUse ৳{pn}art reply to an image and specify a style number to apply a specific style (e.g., 'art 1' for Anime, 'art 2' for Comic Book).`
    }
  },
  onStart: async function ({ message, event, args }) {
    if (!event.messageReply || !event.messageReply.attachments || !event.messageReply.attachments[0]) {
      return message.reply("Please reply to an image to apply the anime filter.");
    }

    const imgurl = encodeURIComponent(event.messageReply.attachments[0].url);
    const style = (args[0] && !isNaN(args[0]) && args[0] >= 1 && args[0] <= 81) ? args[0] : "1";
    const noobs = "xyz";
    const upscaleUrl = `https://smfahim.${noobs}/art?url=${imgurl}&style=${style}`;
    const dateTime = new Date().toISOString().replace(/[:.]/g, "-");
    const imagePath = `/tmp/art${dateTime}.png`;

    message.reply(`🔄| Applying style: ${stylesList[style]}, please wait...`, async (err, info) => {
      if (err) {
        return message.reply("There was an error processing your request.");
      }

      try {
        const response = await axios.get(upscaleUrl, { responseType: "stream" });

        const writer = fs.createWriteStream(imagePath);
        response.data.pipe(writer);

        writer.on("finish", async () => {
          const attachment = fs.createReadStream(imagePath);

          await message.reply({
            body: `✅| Here is your art-filtered image with style: ${stylesList[style]}`,
            attachment: attachment
          });
          let processingMsgID = info.messageID;
          message.unsend(processingMsgID);

          fs.unlink(imagePath, (err) => {
            if (err) console.error("Error deleting the file:", err);
          });
        });

        writer.on("error", (err) => {
          console.error("Error writing the image file:", err);
          message.reply("❌| There was an error saving the anime-filtered image.");
        });

      } catch (error) {
        console.error("Error fetching the image:", error);
        message.reply("❌| There was an error applying the anime filter to your image.");
      }
    });
  }
};
