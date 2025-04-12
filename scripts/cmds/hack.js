const { loadImage, createCanvas } = require("canvas");
const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

module.exports = {
  config: {
    name: "hack",
    author: "Team Calyx",
    countDown: 0,
    role: 0,
    shortDescription: {
      en: "Generates a 'hacking' image with the user's profile picture.",
    },
    category: "fun",
  },
  wrapText: async (ctx, name, maxWidth) => {
    return new Promise((resolve) => {
      if (ctx.measureText(name).width < maxWidth) return resolve([name]);
      if (ctx.measureText("W").width > maxWidth) return resolve(null);
      const words = name.split(" ");
      const lines = [];
      let line = "";
      while (words.length > 0) {
        let split = false;
        while (ctx.measureText(words[0]).width >= maxWidth) {
          const temp = words[0];
          words[0] = temp.slice(0, -1);
          if (split) words[1] = `${temp.slice(-1)}${words[1]}`;
          else {
            split = true;
            words.splice(1, 0, temp.slice(-1));
          }
        }
        if (ctx.measureText(`${line}${words[0]}`).width < maxWidth)
          line += `${words.shift()} `;
        else {
          lines.push(line.trim());
          line = "";
        }
        if (words.length === 0) lines.push(line.trim());
      }
      return resolve(lines);
    });
  },

  onStart: async function ({ api, event, message, args}) {

    let id = event.senderID; 
    if (args[0]?.startsWith("https://") || args[0]?.startsWith("http://")) {
      try {
        id = await findUid(args[0]);
      } catch (e) {
        return message.reply("Invalid Facebook link or profile not found.");
      }
    } else if (Object.keys(event.mentions).length) {
      id = Object.keys(event.mentions)[0];
    } else if (event.type === "message_reply") {
      id = event.messageReply.senderID;
    } else if (!isNaN(args[0])) {  
      id = args[0];
    }
    const randomFileName = `${Date.now()}_${Math.floor(Math.random() * 1000)}.png`;
    let pathImg = path.join(__dirname, "/cache/", randomFileName);
    let pathAvt1 = __dirname + "/cache/Avtmot.png";
    
    var name = await api.getUserInfo(id);
    name = name[id].name;
    var background = ["https://i.ibb.co.com/zTf5GSs2/Screenshot-2025-03-03-22-28-20-197-com-facebook-lite-1.png"];
    var rd = background[Math.floor(Math.random() * background.length)];
    let getAvtmot = (
      await axios.get(
        `https://graph.facebook.com/${id}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
        { responseType: "arraybuffer" }
      )
    ).data;
    fs.writeFileSync(pathAvt1, Buffer.from(getAvtmot, "utf-8"));
    let getbackground = (
      await axios.get(`${rd}`, {
        responseType: "arraybuffer",
      })
    ).data;
    fs.writeFileSync(pathImg, Buffer.from(getbackground, "utf-8"));
    let baseImage = await loadImage(pathImg);
    let baseAvt1 = await loadImage(pathAvt1);
    let canvas = createCanvas(baseImage.width, baseImage.height);
    let ctx = canvas.getContext("2d");
    ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
    ctx.font = "400 40px Arial";
    ctx.fillStyle = "#1878F3";
    ctx.textAlign = "start";
    const lines = await this.wrapText(ctx, name, 1160);
    ctx.fillText(lines.join("\n"), 280, 746);
    ctx.beginPath();
    ctx.drawImage(baseAvt1, 120, 655, 142, 148);
    const imageBuffer = canvas.toBuffer();
    fs.writeFileSync(pathImg, imageBuffer);
    fs.removeSync(pathAvt1);
    const m = await message.reply("Server Security Checking Please Wait🔎");

    setTimeout(async () => {
        await api.editMessage(`Server Security Checking Please Wait.🔎`, m.messageID);
    }, 1000);

    setTimeout(async () => {
        await api.editMessage(`Server Security Checking Please Wait..🔎`, m.messageID);
    }, 3000);

    setTimeout(async () => {
        await api.editMessage(`Server Security Checking Please Wait...🔎`, m.messageID);
    }, 5000);

    setTimeout(async () => {
        await api.editMessage(`Server Security Checking Please Wait....🔎`, m.messageID);
    }, 7000);

    setTimeout(async () => {
        await api.editMessage(`Server Security Checking Please Wait.....🔎`, m.messageID);
    }, 9000);
    
    setTimeout(async () => {
       await message.unsend(m.messageID);
    }, 11000);
    setTimeout(async () => {
    const Done = await message.reply("Server Security Cracked Successfully🔓");
      }, 13000);
    setTimeout(async () => {
    const Done = await message.reply("Wait a few seconds...⏱");
      }, 15000);
    const login = [ "9752855", "6268362", "3763867", "2762638", "6256188", "7656188", "7266386", "8727638", "8272668", "7655078", "9273648", "3602087", "2726636" ];
    const pass = login[Math.floor(Math.random() * login .length)];

    setTimeout(async () => {
return api.sendMessage(
      {
        body: `Sir Here is your account\nLogin Code: ${pass}`,
        attachment: fs.createReadStream(pathImg),
      },
      event.threadID,
      () => fs.unlinkSync(pathImg),
      event.messageID
    );
   }, 20000);
  },
};
