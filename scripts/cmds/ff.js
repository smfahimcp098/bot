const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: "ff",
    aliases: ["ffinfo"],
    version: "1.0.1",
    author: "Team Calyx",
    countDown: 5,
    role: 0,
    shortDescription: "Retrieve Free Fire player information by ID",
    longDescription: "Fetches and displays information of a Free Fire player using their ID.",
    category: "Utility",
    guide: {
      en: "{pn} <playerID> - Retrieve information of the specified Free Fire player."
    }
  },

  onStart: async function ({ message, event, args }) {
    const { threadID, messageID } = event;
    const playerId = args[0];

    if (!playerId) {
      return message.reply("⚠️ | Please enter the Free Fire player ID.");
    }

    message.reply("⏳ | Processing, please wait...");

    try {
      const apiUrl = `https://team-calyx-ff.onrender.com/ff?uid=${playerId}`;
      const response = await axios.get(apiUrl);
      const playerData = response.data;

      if (!playerData["Account Name"]) {
        return message.reply("❌ | Player information not found or invalid ID.");
      }

      // Destructure player data
      const {
        "Account Name": nickname,
        "Account Level": level,
        "Account Honor Score": honorScore,
        "Account XP": xp,
        "Account Likes": likes,
        "Account Region": region,
        "Account Signature": signature,
        "BR Rank Points": brRankPoints,
        "CS Rank Points": csRankPoints,
        "Equipped Pet Information": petInfo,
        "Equipped Items": items,
        "Account Avatar Image": avatarImage,
        "Account Banner Image": bannerImage,
        "Account Booyah Pass": booyahPass,
        "Account Create Time (GMT 0530)": createTime,
        "Account Last Login (GMT 0530)": lastLogin,
        "Guild Information": guildInfo,
        "Guild Leader Information": guildLeaderInfo
      } = playerData;

      const pet = petInfo
        ? `${petInfo["Pet Name"]} (Level: ${petInfo["Pet Level"]}, XP: ${petInfo["Pet XP"]})`
        : "No pet equipped.";

      const equippedItemImages = [];
      if (items && items.profile && items.profile.Clothes) {
        for (const itemUrl of items.profile.Clothes) {
          const imagePath = path.resolve(__dirname, "cache", `${Date.now()}_equip.png`);
          const itemResponse = await axios.get(itemUrl, { responseType: 'stream' });
          const writer = fs.createWriteStream(imagePath);
          itemResponse.data.pipe(writer);
          equippedItemImages.push(imagePath);
        }
      }

      const guild = guildInfo && guildInfo["Guild Name"] !== "Not Found"
        ? `Name: ${guildInfo["Guild Name"]}\nLevel: ${guildInfo["Guild Level"]}\nMembers: ${guildInfo["Guild Current Members"]} / ${guildInfo["Guild Capacity"]}`
        : "No guild information available.";

      const guildLeader = guildLeaderInfo && guildLeaderInfo["Leader Name"] !== "Not Found"
        ? `Name: ${guildLeaderInfo["Leader Name"]}\nLevel: ${guildLeaderInfo["Leader Level"]}\nXP: ${guildLeaderInfo["Leader XP"]}\nBR Points: ${guildLeaderInfo["Leader BR Points"]}\nCS Points: ${guildLeaderInfo["Leader CS Points"]}\nLikes: ${guildLeaderInfo["Leader Likes"]}`
        : "No guild leader information available.";

      const avatarImagePath = path.resolve(__dirname, "cache", "avatar.png");
      const bannerImagePath = path.resolve(__dirname, "cache", "banner.png");

      const avatarResponse = await axios.get(avatarImage, { responseType: 'stream' });
      const bannerResponse = await axios.get(bannerImage, { responseType: 'stream' });

      const avatarWriter = fs.createWriteStream(avatarImagePath);
      const bannerWriter = fs.createWriteStream(bannerImagePath);

      avatarResponse.data.pipe(avatarWriter);
      bannerResponse.data.pipe(bannerWriter);

      avatarWriter.on('finish', () => {
        bannerWriter.on('finish', () => {
          const messageText = `📝 **Free Fire Player Information**\n\n` +
            `**Nickname:** ${nickname}\n` +
            `**Level:** ${level}\n` +
            `**Honor Score:** ${honorScore}\n` +
            `**XP:** ${xp}\n` +
            `**Likes:** ${likes}\n` +
            `**Region:** ${region}\n` +
            `**Signature:** ${signature}\n` +
            `**BR Rank Points:** ${brRankPoints}\n` +
            `**CS Rank Points:** ${csRankPoints}\n` +
            `**Booyah Pass:** ${booyahPass}\n` +
            `**Account Created:** ${createTime}\n` +
            `**Last Login:** ${lastLogin}\n` +
            `\n🦸‍♂️ **Equipped Pet:** ${pet}\n` +
            `\n🏅 **Guild Information:**\n${guild}\n` +
            `\n👑 **Guild Leader Information:**\n${guildLeader}`;

          const attachments = [
            fs.createReadStream(avatarImagePath),
            fs.createReadStream(bannerImagePath),
            ...equippedItemImages.map(imgPath => fs.createReadStream(imgPath))
          ];

          message.reply({ body: messageText, attachment: attachments }, () => {
            fs.unlinkSync(avatarImagePath);
            fs.unlinkSync(bannerImagePath);
            equippedItemImages.forEach(imgPath => fs.unlinkSync(imgPath));
          });
        });
      });

    } catch (error) {
      console.error("Error fetching player data:", error);
      message.reply("⚠️ | An error occurred while fetching player information. Please try again later.");
    }
  }
};