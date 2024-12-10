const { getStreamsFromAttachment } = global.utils;

module.exports = {
  config: {
    name: "notice",
    aliases: [],
    version: "1.0.1",
    author: "S M Fàhîm",
    countDown: 5,
    role: 2,
    shortDescription: {
      en: "Send notification from admin to all box"
    },
    longDescription: {
      en: "Send notification from admin to all box"
    },
    category: "admin",
    guide: {
      en: "{pn} <notice text>"
    },
    envConfig: {
      delayPerGroup: 250
    }
  },

  langs: {

    en: {
      missingMessage: "Please enter the message you want to send to all groups",
      notification: "<< 𝗡𝗢𝗧𝗜𝗖𝗘 >> | 𝗠𝗔𝗟𝗧𝗔 𝗔𝗜 𝗕𝗢𝗧 🥀",
      sendingNotification: "Start sending notification from admin bot to %1 chat groups",
      sentNotification: "✅ Sent notification to %1 groups successfully",
      errorSendingNotification: "An error occurred while sending to %1 groups:\n%2"
    }
  },

  onStart: async function ({ message, api, event, args, commandName, envCommands, threadsData, getLang }) {
    const { delayPerGroup } = envCommands[commandName];
    if (!args[0])
      return message.reply(getLang("missingMessage"));
    const formSend = {
      body: `${getLang("notification")}\n━━━━━━━━━━━━━━━━━━━\n${args.join(" ")} \n━━━━━━━━━━━━━━━━━━━\n~ 𝗔𝗗𝗠𝗜𝗡 𝗣𝗔𝗡𝗘𝗟 : 𝗔𝗟𝗜𝗧𝗘 𝗡𝗘𝗧𝗪𝗢𝗥𝗞 𝗧𝗘𝗔𝗠 , 𝗕𝗗🥀`,
      attachment: await getStreamsFromAttachment(
        [
          ...event.attachments,
          ...(event.messageReply?.attachments || [])
        ].filter(item => ["photo", "png", "animated_image", "video", "audio"].includes(item.type))
      )
    };

    const allThreadID = (await threadsData.getAll()).filter(t => t.isGroup && t.members.find(m => m.userID == api.getCurrentUserID())?.inGroup);
    message.reply(getLang("sendingNotification", allThreadID.length));

    let sendSucces = 0;
    const sendError = [];
    const wattingSend = [];

    for (const thread of allThreadID) {
      const tid = thread.threadID;
      try {
        wattingSend.push({
          threadID: tid,
          pending: api.sendMessage(formSend, tid)
        });
        await new Promise(resolve => setTimeout(resolve, delayPerGroup));
      }
      catch (e) {
        sendError.push(tid);
      }
    }

    for (const sended of wattingSend) {
      try {
        await sended.pending;
        sendSucces++;
      }
      catch (e) {
        const { errorDescription } = e;
        if (!sendError.some(item => item.errorDescription == errorDescription))
          sendError.push({
            threadIDs: [sended.threadID],
            errorDescription
          });
        else
          sendError.find(item => item.errorDescription == errorDescription).threadIDs.push(sended.threadID);
      }
    }

    let msg = "";
    if (sendSucces > 0)
      msg += getLang("sentNotification", sendSucces) + "\n";
    if (sendError.length > 0)
      msg += getLang("errorSendingNotification", sendError.reduce((a, b) => a + b.threadIDs.length, 0), sendError.reduce((a, b) => a + `\n - ${b.errorDescription}\n  + ${b.threadIDs.join("\n  + ")}`, ""));
    message.reply(msg);
  }
};