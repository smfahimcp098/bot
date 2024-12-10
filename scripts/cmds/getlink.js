const axios = require('axios');
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "getlink",
    aliases: ["getlink"],
    version: "1.0",
    author: "milan-says",
    countDown: 5,
    role: 0,
    shortDescription: "Get download url from video, audio sent from group",
    longDescription: "",
    category: "utility",
    guide: "{pn} "
  },

  onStart: async function ({ api, event, args}) {
  if (event.type !== "message_reply") return api.sendMessage(getText("invaidFormat"), event.threadID, event.messageID);
  if (!event.messageReply.attachments || event.messageReply.attachments.length == 0) return api.sendMessage(getText("invaidFormat"), event.threadID, event.messageID);
  if (event.messageReply.attachments.length > 1) return api.sendMessage(getText("invaidFormat"), event.threadID, event.messageID);
  return api.sendMessage(event.messageReply.attachments[0].url, event.threadID, event.messageID);
    }
  };