const axios = require("axios");
const { getStreamFromURL } = global.utils;
const myApi = "https://for-devs.ddns.net/api/mj/imagine";

module.exports.config = {
  name: "midjourney",
  aliases: ["mj"],
  version: "1.3",
  role: 1,
  author: "S M Fahim | Rishad Apis",
  description: "MidJourney image generator with polling and action support",
  guide: "{pn} [prompt]",
  category: "ai",
  countDown: 20,
};

async function pollTask(apiKey, taskId, token, interval = 3000, timeout = 600000) {
  const taskUrl = `https://for-devs.ddns.net/api/mj/task?apikey=${apiKey}&taskId=${taskId}&token=${token}`;
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const res = await axios.get(taskUrl);
    const data = res.data;
    if (data.status === "SUCCESS" && data.imageUrl) return data;
    if (data.status === "failed" || data.status === "FAILURE") throw new Error("Task failed");
    await new Promise((r) => setTimeout(r, interval));
  }
  throw new Error("Polling timed out");
}

module.exports.onStart = async function ({ message, args, event }) {
  try {
    const prompt = args.join(" ").trim();
    if (!prompt) return message.reply("❎ | Please provide a prompt.");

    const apiKey = "r-rishad100";
    const imagineUrl = `${myApi}?apikey=${apiKey}&prompt=${encodeURIComponent(
      prompt
    )}&v=7.0&ratio=1:1`;
    const waitInitial = await message.reply("⏳ | Generating image...");
    const initialRes = await axios.get(imagineUrl);
    const { taskId, token, expectedSeconds } = initialRes.data;
    const taskData = await pollTask(apiKey, taskId, token, Math.max(expectedSeconds * 1000, 3000));
    await message.unsend(waitInitial.messageID);

    const sent = await message.reply({
      body: `✅ | Midjourney process completed ✨\n\n❏ Available actions:\nU1, U2, U3, U4, 🔃, V1, V2, V3, V4`,
      attachment: await getStreamFromURL(taskData.imageUrl),
    });

    global.GoatBot.onReply.set(sent.messageID, {
      commandName: this.config.name,
      type: "reply",
      messageID: sent.messageID,
      author: event.senderID,
      apiKey,
      taskId,
      token,
      actions: taskData.buttons,
    });
  } catch (e) {
    console.error(e);
    return message.reply(`❎ | Error: ${e.message}`);
  }
};

module.exports.onReply = async function ({ event, message, Reply }) {
  if (Reply.author !== event.senderID) return;

  const text = event.body.trim().toLowerCase();
  const { apiKey, taskId, token, actions } = Reply;

  let isU = false,
    isV = false,
    choiceIndex = -1;

  if (/^u[1-4]$/.test(text)) {
    isU = true;
    choiceIndex = parseInt(text[1], 10) - 1;
  } else if (/^v[1-4]$/.test(text)) {
    isV = true;
    choiceIndex = parseInt(text[1], 10) - 1;
  }

  if (isU || isV) {
    const actionObj = actions[isU ? choiceIndex : choiceIndex + 4];
    if (!actionObj || !actionObj.customId) {
      return message.reply("❎ | Invalid action selected.");
    }

    let bodyText;
    if (isU) {
      bodyText = `✅ | Midjourney upscale completed`;
    } else {
      bodyText = `✅ | Midjourney variation completed ✨

❏ Available actions:
U1, U2, U3, U4`;
    }

    const waitAct = await message.reply("⏳ | Job request added. Please wait...");

    try {
      const actRes = await axios.get(
        `https://for-devs.ddns.net/api/mj/action?apikey=${apiKey}&customId=${encodeURIComponent(
          actionObj.customId
        )}&taskId=${taskId}`
      );
      await message.unsend(waitAct.messageID);

      let result = actRes.data;
      if (!result.imageUrl && (result.taskId || result.id) && result.token) {
        result = await pollTask(apiKey, result.taskId || result.id, result.token);
      }

      const hasNewButtons = Array.isArray(result.buttons) && result.buttons.length > 0;

      const sent = await message.reply({
        body: bodyText,
        attachment: await getStreamFromURL(result.imageUrl),
      });

      if (hasNewButtons) {
        const nextActions = result.buttons.filter((b) => b.label.startsWith("U"));
        global.GoatBot.onReply.set(sent.messageID, {
          commandName: this.config.name,
          type: "reply",
          messageID: sent.messageID,
          author: event.senderID,
          apiKey,
          taskId: result.taskId || result.id || taskId,
          token: result.token || token,
          actions: nextActions,
        });
      }
    } catch (err) {
      console.error(err);
      return message.reply(`❎ | Error: ${err.message}`);
    }

    return; 
  }

  return message.reply("❎ | Please reply with U1–U4 or V1–V4 to choose an action.");
};
