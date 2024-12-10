
module.exports = {
  config: {
    name: "supportgc",
    aliases: ["support"],
    version: "1.0",
    author: "Loid Butter ",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Add user to support group",
    },
    longDescription: {
      en: "This command adds the user to the admin support group.",
    },
    category: "support",
    guide: {
      en: "╔════ஜ۩۞۩ஜ═══╗\n\nTo use this command, simply type support.\n\n╚════ஜ۩۞۩ஜ═══╝",
    },
  },

  // onStart is a function that will be executed when the command is executed
  onStart: async function ({ api, args, message, event }) {
    const supportGroupId = "6726613917456356"; // ID of the support group

    const threadID = event.threadID;
    const userID = event.senderID;

    // Check if the user is already in the support group
    const threadInfo = await api.getThreadInfo(supportGroupId);
    const participantIDs = threadInfo.participantIDs;
    if (participantIDs.includes(userID)) {
      // User is already in the support group
      api.sendMessage(
        "<< 𝗦𝗨𝗣𝗣𝗢𝗥𝗧𝗚𝗖 >> | 𝗠𝗔𝗟𝗧𝗔 𝗔𝗜 𝗕𝗢𝗧\n━━━━━━━━━━━━━━━━━━━\n\nYou are already in the support group. If you didn't find it, please check your message requests or spam box. \n\nOr join :  https://m.me/j/AbYvUbsI8D1d2SJ8/ \n\n━━━━━━━━━━━━━━━━━━━",
        threadID
      );
    } else {
      // Add user to the support group
      api.addUserToGroup(userID, supportGroupId, (err) => {
        if (err) {
          console.error("<< 𝗦𝗨𝗣𝗣𝗢𝗥𝗧𝗚𝗖 >> | 𝗠𝗔𝗟𝗧𝗔 𝗔𝗜 𝗕𝗢𝗧\n━━━━━━━━━━━━━━━━━━━\n\nFailed to add user to support group:\n\n━━━━━━━━━━━━━━━━━━━", err);
          api.sendMessage("<< 𝗦𝗨𝗣𝗣𝗢𝗥𝗧𝗚𝗖 >> | 𝗠𝗔𝗟𝗧𝗔 𝗔𝗜 𝗕𝗢𝗧\n━━━━━━━━━━━━━━━━━━━\n\nI can't add you because your id is not allowed message request or your account is private. please add me then try again... \nOr join :  https://m.me/j/AbYvUbsI8D1d2SJ8/ \n\n━━━━━━━━━━━━━━━━━━━", threadID);
        } else {
          api.sendMessage(
            "<< 𝗦𝗨𝗣𝗣𝗢𝗥𝗧𝗚𝗖 >> | 𝗠𝗔𝗟𝗧𝗔 𝗔𝗜 𝗕𝗢𝗧\n━━━━━━━━━━━━━━━━━━━\n\nYou have been added to the admin support group. If you didn't find the box in your inbox, please check your message requests or spam box. \nOr join :  https://m.me/j/AbYvUbsI8D1d2SJ8/ \n\n━━━━━━━━━━━━━━━━━━━",
            threadID
          );
        }
      });
    }
  },
};
