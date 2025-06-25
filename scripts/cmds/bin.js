const fs = require("fs").promises;
const axios = require("axios");
const path = require("path");

module.exports.config = {
  name: "bin",
  aliases: [],
  version: "1.0.2",
  role: 2,
  author: "S M Fahim",
  category: "admin",
  guide: { 
    en: "{p}bin <fileName> or reply code\n\n" +
        "Examples:\n" +
        "  • !bin myModule\n" +
        "  • (reply to a message containing code and type) !bin\n\n" +
        "Note:\n" +
        "  – The file must be in the `cmds` folder (with or without .js extension).\n" +
        "  – The bot generates a new ID, saves the content, and returns both “/save/ID” and “/raw/ID” links."
  },
  countDown: 3,
};

module.exports.onStart = async function ({ api, event, args }) {
  let code = null;

  if (event.type === "message_reply" && event.messageReply.body) {
    code = event.messageReply.body;
  }
  else if (args[0]) {
    const fileName = args[0];
    const cmdsDir = path.join(__dirname, "..", "cmds");
    const filePathNoExt = path.join(cmdsDir, fileName);
    const filePathJsExt = path.join(cmdsDir, fileName + ".js");

    try {
      code = await fs.readFile(filePathNoExt, "utf8");
    } catch {
      try {
        code = await fs.readFile(filePathJsExt, "utf8");
      } catch {
        return api.sendMessage(
          "❌ File not found.",
          event.threadID,
          event.messageID
        );
      }
    }
  } else {
    return api.sendMessage(
      "❗ Usage:\n" +
      "  • Reply to a message containing code, then type `!bin`\n" +
      "  • Or, `!bin <filename>` (file: cmds/<filename>.js বা cmds/<filename>)\n",
      event.threadID,
      event.messageID
    );
  }

  try {
    const saveRedirect = await axios.get("https://cdn.smfahim.xyz/save", {
      maxRedirects: 0,
      validateStatus: (status) => status === 302
    });

    const locationHeader = saveRedirect.headers.location;
    if (!locationHeader || !locationHeader.startsWith("/save/")) {
      throw new Error("Invalid redirect from /save");
    }
    const newId = locationHeader.split("/save/")[1];

    await axios.post(
      "https://cdn.smfahim.xyz/save",
      {
        bool: true,
        text: code,
        uri: `/save/${newId}`
      },
      { headers: { "Content-Type": "application/json" } }
    );

    const normalUrl = `https://cdn.smfahim.xyz/save/${newId}`;
    const rawUrl    = `https://cdn.smfahim.xyz/raw/${newId}`;

    return api.sendMessage(
      `✅ Uploaded successfully!\n` +
      `• PasteBin Link: ${normalUrl}\n` +
      `• Raw Link:   ${rawUrl}`,
      event.threadID,
      event.messageID
    );
  } catch (err) {
    console.error("PasteBin upload error:", err);
    return api.sendMessage(
      "❌ Failed to upload to pastebin.smfahim.xyz.",
      event.threadID,
      event.messageID
    );
  }
};
