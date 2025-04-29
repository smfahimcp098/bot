const { loadImage, createCanvas } = require("canvas");
const fs = require("fs");
const axios = require("axios");

// ======================
// EMOJI CONFIGURATION
// ======================
const EMOJI_CDN_BASE = "https://em-content.zobj.net/source/facebook/355/";
const EMOJI_SIZE = 80;
const EMOJI_CACHE = new Map();
const EMOJI_MAP = {
  "😀": "grinning-face_1f600",
  "😃": "grinning-face-with-big-eyes_1f603",
  "😄": "grinning-face-with-smiling-eyes_1f604",
  "😁": "beaming-face-with-smiling-eyes_1f601",
  "😆": "grinning-squinting-face_1f606",
  "😅": "grinning-face-with-sweat_1f605",
  "🤣": "rolling-on-the-floor-laughing_1f923",
  "😂": "face-with-tears-of-joy_1f602",
  "🙂": "slightly-smiling-face_1f642",
  "🙃": "upside-down-face_1f643",
  "😉": "winking-face_1f609",
  "😊": "smiling-face-with-smiling-eyes_1f60a",
  "😇": "smiling-face-with-halo_1f607",
  "🥰": "smiling-face-with-hearts_1f970",
  "😍": "smiling-face-with-heart-eyes_1f60d",
  "🤩": "star-struck_1f929",
  "😘": "face-blowing-a-kiss_1f618",
  "😗": "kissing-face_1f617",
  "😚": "kissing-face-with-closed-eyes_1f61a",
  "😙": "kissing-face-with-smiling-eyes_1f619",
  "🥲": "smiling-face-with-tear_1f972",
  "😋": "face-savoring-food_1f60b",
  "😛": "face-with-tongue_1f61b",
  "😜": "winking-face-with-tongue_1f61c",
  "🤪": "zany-face_1f92a",
  "😝": "squinting-face-with-tongue_1f61d",
  "🤑": "money-mouth-face_1f911",
  "🤗": "hugging-face_1f917",
  "🤭": "face-with-hand-over-mouth_1f92d",
  "🤫": "shushing-face_1f92b",
  "🤔": "thinking-face_1f914",
  "🤐": "zipper-mouth-face_1f910",
  "🤨": "face-with-raised-eyebrow_1f928",
  "😐": "neutral-face_1f610",
  "😑": "expressionless-face_1f611",
  "😶": "face-without-mouth_1f636",
  "😏": "smirking-face_1f60f",
  "😒": "unamused-face_1f612",
  "🙄": "face-with-rolling-eyes_1f644",
  "😬": "grimacing-face_1f62c",
  "😮‍💨": "face-exhaling_1f62e-200d-1f4a8",
  "🤥": "lying-face_1f925",
  "😌": "relieved-face_1f60c",
  "😔": "pensive-face_1f614",
  "😪": "sleepy-face_1f62a",
  "🤤": "drooling-face_1f924",
  "😴": "sleeping-face_1f634",
  "😷": "face-with-medical-mask_1f637",
  "🤒": "face-with-thermometer_1f912",
  "🤕": "face-with-head-bandage_1f915",
  "🤢": "nauseated-face_1f922",
  "🤮": "face-vomiting_1f92e",
  "🤧": "sneezing-face_1f927",
  "🥵": "hot-face_1f975",
  "🥶": "cold-face_1f976",
  "🥴": "woozy-face_1f974",
  "😵": "dizzy-face_1f635",
  "😵‍💫": "face-with-spiral-eyes_1f635-200d-1f4ab",
  "🤯": "exploding-head_1f92f",
  "🤠": "cowboy-hat-face_1f920",
  "🥳": "partying-face_1f973",
  "🥸": "disguised-face_1f978",
  "😎": "smiling-face-with-sunglasses_1f60e",
  "🤓": "nerd-face_1f913",
  "🧐": "face-with-monocle_1f9d0",
  "😕": "confused-face_1f615",
  "😟": "worried-face_1f61f",
  "🙁": "slightly-frowning-face_1f641",
  "☹️": "frowning-face_2639-fe0f",
  "😮": "face-with-open-mouth_1f62e",
  "😯": "hushed-face_1f62f",
  "😲": "astonished-face_1f632",
  "😳": "flushed-face_1f633",
  "🥺": "pleading-face_1f97a",
  "😦": "frowning-face-with-open-mouth_1f626",
  "😧": "anguished-face_1f627",
  "😨": "fearful-face_1f628",
  "😰": "anxious-face-with-sweat_1f630",
  "😥": "sad-but-relieved-face_1f625",
  "😢": "crying-face_1f622",
  "🥹": "face-holding-back-tears_1f979",
  "😭": "loudly-crying-face_1f62d",
  "😱": "face-screaming-in-fear_1f631",
  "😖": "confounded-face_1f616",
  "😣": "persevering-face_1f623",
  "😞": "disappointed-face_1f61e",
  "😓": "downcast-face-with-sweat_1f613",
  "😩": "weary-face_1f629",
  "😫": "tired-face_1f62b",
  "🥱": "yawning-face_1f971",
  "😤": "face-with-steam-from-nose_1f624",
  "🫣": "face-with-peeking-eye_1fae3",
  "🫨": "shaking-face_1fae8",
  "😡": "pouting-face_1f621",
  "😠": "angry-face_1f620",
  "🤬": "face-with-symbols-on-mouth_1f92c",
  "😈": "smiling-face-with-horns_1f608",
  "👿": "angry-face-with-horns_1f47f",
  "💀": "skull_1f480",
  "☠️": "skull-and-crossbones_2620-fe0f",
  "💩": "pile-of-poo_1f4a9",
  "🤡": "clown-face_1f921",
  "👶": "baby_1f476",
  "👹": "ogre_1f479",
  "👺": "goblin_1f47a",
  "👻": "ghost_1f47b",
  "👽": "alien_1f47d",
  "👾": "alien-monster_1f47e",
  "🤖": "robot_1f916",
  "😺": "grinning-cat_1f63a",
  "😸": "grinning-cat-with-smiling-eyes_1f638",
  "😹": "cat-with-tears-of-joy_1f639",
  "😻": "smiling-cat-with-heart-eyes_1f63b",
  "😼": "cat-with-wry-smile_1f63c",
  "😽": "kissing-cat_1f63d",
  "🙀": "weary-cat_1f640",
  "😿": "crying-cat_1f63f",
  "😾": "pouting-cat_1f63e",
  "🙈": "see-no-evil-monkey_1f648",
  "🙉": "hear-no-evil-monkey_1f649",
  "🙊": "speak-no-evil-monkey_1f64a",
  "🐷": "pig-face_1f437",
  "🦢": "swan_1f9a2",
  "🐶": "dog-face_1f436",
  "🐼": "panda_1f43c",
  "🐸": "frog_1f438",
  "🐮": "cow-face_1f42e",
  "🐹": "hamster_1f439",
  "🐭": "mouse-face_1f42d",
  "🐔": "chicken_1f414",
  "🦄": "unicorn_1f984",
  "🦎": "lizard_1f98e",
  "🐍": "snake_1f40d",
  "🐧": "penguin_1f427",
  "🦂": "scorpion_1f982",
  "🦋": "butterfly_1f98b",
  "💋": "kiss-mark_1f48b",
  "💌": "love-letter_1f48c",
  "💘": "heart-with-arrow_1f498",
  "💝": "heart-with-ribbon_1f49d",
  "💖": "sparkling-heart_1f496",
  "💗": "growing-heart_1f497",
  "💓": "beating-heart_1f493",
  "💞": "revolving-hearts_1f49e",
  "💔": "broken-heart_1f494",
  "❤️‍🔥": "heart-on-fire_2764-fe0f-200d-1f525",
  "❤️‍🩹": "mending-heart_2764-fe0f-200d-1fa79",
  "🧡": "orange-heart_1f9e1",
  "💛": "yellow-heart_1f49b",
  "💚": "green-heart_1f49a",
  "💙": "blue-heart_1f499",
  "💜": "purple-heart_1f49c",
  "🤎": "brown-heart_1f90e",
  "🖤": "black-heart_1f5a4",
  "🤍": "white-heart_1f90d",
  "🫵": "index-pointing-at-the-viewer_1faf5",
  "👎": "thumbs-down_1f44e",
  "✊": "raised-fist_270a",
  "🤚": "raised-back-of-hand_1f91a",
  "🖖": "vulcan-salute_1f596",
  "🤏": "pinching-hand_1f90f",
  "🖕": "middle-finger_1f595",
  "👊": "oncoming-fist_1f44a",
  "👋": "waving-hand_1f44b",
  "👌": "ok-hand_1f44c",
  "🤌": "pinched-fingers_1f90c",
  "✌️": "victory-hand_270c-fe0f",
  "🤞": "crossed-fingers_1f91e",
  "🤟": "love-you-gesture_1f91f",
  "👉": "backhand-index-pointing-right_1f449",
  "👈": "backhand-index-pointing-left_1f448",
  "🫰": "hand-with-index-finger-and-thumb-crossed_1faf0",
  "🫶": "heart-hands_1faf6",
  "🤝": "handshake_1f91d",
  "💯": "hundred-points_1f4af",
  "💢": "anger-symbol_1f4a2",
  "💥": "collision_1f4a5",
  "💫": "dizzy_1f4ab",
  "💦": "sweat-droplets_1f4a6",
  "💨": "dashing-away_1f4a8",
  "🕳️": "hole_1f573-fe0f",
  "💣": "bomb_1f4a3",
  "🧠": "brain_1f9e0",
  "🫀": "anatomical-heart_1fac0",
  "🔞": "no-one-under-eighteen_1f51e",
  "🩲": "briefs_1fa72",
  "🩴": "thong-sandal_1fa74",
  "🥇": "1st-place-medal_1f947",
  "🥈": "2nd-place-medal_1f948",
  "🥉": "3rd-place-medal_1f949",
  "🎱": "pool-8-ball_1f3b1",
  "🏆": "trophy_1f3c6"
};

async function loadEmoji(emoji) {
  if (EMOJI_CACHE.has(emoji)) return EMOJI_CACHE.get(emoji);
  const emojiData = EMOJI_MAP[emoji];
  if (!emojiData) return null;
  try {
    const url = `${EMOJI_CDN_BASE}${emojiData}.png`;
    const res = await axios.get(url, { responseType: "arraybuffer", timeout: 3000 });
    const img = await loadImage(Buffer.from(res.data));
    EMOJI_CACHE.set(emoji, img);
    return img;
  } catch (e) {
    console.warn(`Failed to load emoji ${emoji}:`, e.message);
    return null;
  }
}

async function drawTextWithEmojis(ctx, text, x, y) {
  let xPos = x;
  for (const char of text) {
    if (EMOJI_MAP[char]) {
      const emojiImg = await loadEmoji(char);
      if (emojiImg) {
        ctx.drawImage(emojiImg, xPos, y - EMOJI_SIZE * 0.75, EMOJI_SIZE, EMOJI_SIZE);
        xPos += EMOJI_SIZE;
        continue;
      }
    }
    ctx.fillText(char, xPos, y);
    xPos += ctx.measureText(char).width;
  }
  return xPos;
}

module.exports = {
  config: {
    name: "gc",
    aliases: [],
    author: "ChatGpt | Your Dad",
    countDown: 5,
    role: 0,
    category: "fun",
    shortDescription: {
      vi: "lấy ảnh chat giả",
      en: "get fakechat image"
    },
    description: {
      vi: "tạo ảnh chat giả với emoji và nền tùy chọn",
      en: "generate a fake chat image with emojis and custom background"
    },
    guide: {
      vi: "sử dụng: fc <text> ++ <text> | reply | --user <link> or <uid> | --theme <theme number> | --attachment <image url> | blank",
      en: "use: fc <text> ++ <text> | reply | --user <link> or <uid> | --theme <theme number> | --attachment <image url> | blank"
    }
  },

  wrapText: async function (ctx, text, maxWidth) {
    const segments = text.split("++");
    const lines = [];
    for (const segment of segments) {
      const words = segment.split(/(\s+)/);
      let currentLine = "";
      let currentWidth = 0;
      for (const word of words) {
        let wordWidth = 0;
        for (const char of word) {
          wordWidth += EMOJI_MAP[char] ? EMOJI_SIZE : ctx.measureText(char).width;
        }
        if (currentWidth + wordWidth <= maxWidth) {
          currentLine += word;
          currentWidth += wordWidth;
        } else {
          if (currentLine.trim()) {
            lines.push({ text: currentLine.trim(), width: currentWidth });
          }
          currentLine = word;
          currentWidth = wordWidth;
        }
      }
      if (currentLine.trim()) {
        lines.push({ text: currentLine.trim(), width: currentWidth });
      }
    }
    return lines;
  },

  onStart: async function ({ args, api, event }) {
    let userInput = args.join(" ");
    let pathImg = __dirname + "/tmp/background.png";
    let pathAvt1 = __dirname + "/tmp/Avtmot.png";
    let pathReplyImage = __dirname + "/tmp/replyImage.png";
    let mentionedID = event.senderID;

    let replyImage = null;
    if (event?.messageReply?.attachments[0]?.type === "photo") {
      const imageUrl = event.messageReply.attachments[0].url;
      const imageData = (await axios.get(imageUrl, { responseType: "arraybuffer" })).data;
      fs.writeFileSync(pathReplyImage, Buffer.from(imageData, "binary"));
      replyImage = await loadImage(pathReplyImage);
    } else if (userInput.match(/--attachment/)) { 
      const imageUrl = (userInput.split("--attachment ")[1]).split(" ")[0];
      const imageData = (await axios.get(imageUrl, { responseType: "arraybuffer" })).data;
      fs.writeFileSync(pathReplyImage, Buffer.from(imageData, "binary"));
      replyImage = await loadImage(pathReplyImage);
    }

    if (event?.messageReply?.senderID === "100004768956931" && event.senderID === "100063840894133") { 
    } else if (event?.messageReply?.senderID === "100004768956931") { 
      userInput = "hi, i am good boy";
    } else if (event.messageReply) { 
      mentionedID = event.messageReply.senderID;
    } else if (userInput.match(/--user /)) {
      if ((userInput.split("--user ")[1]).match(/.com/)) { 
        mentionedID = await api.getUID((userInput.split("--user ")[1]).split(" ")[0]);
      } else { 
        mentionedID = (userInput.split("--user ")[1]).split(" ")[0];
      }
    }
    let mentionedName = (await api.getUserInfo(mentionedID))[mentionedID].name;
        let background = [
          "https://i.ibb.co.com/HfnW8KxV/messanger-1.png",
          "https://i.ibb.co.com/VY8BzpXb/messanger-2.png", 
          "https://i.ibb.co.com/gFXzGd75/messanger-3.png"
        ];
        let bn = 0;
        if (userInput.match(/--theme/)) { 
          bn = (userInput.split("--theme ")[1]).split(" ")[0];
        }

        let commentText = userInput.split("--")[0];
        const gapAdjust = (userInput.split("++").length - 1) * 12;
        let rd = background[bn];
        let getAvtmot = (await axios.get(
          `https://graph.facebook.com/${mentionedID}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
          { responseType: "arraybuffer" }
        )).data;
        fs.writeFileSync(pathAvt1, Buffer.from(getAvtmot, "binary"));
        let getbackground = (await axios.get(`${rd}`, { responseType: "arraybuffer" })).data;
        fs.writeFileSync(pathImg, Buffer.from(getbackground, "binary"));
        let baseImage = await loadImage(pathImg);
        let baseAvt1 = await loadImage(pathAvt1);
        let baseAvt2 = await loadImage(pathAvt1);

        let tempCanvas = createCanvas(1, 1);
        let tempCtx = tempCanvas.getContext("2d");
        tempCtx.font = "540 75px 'Segoe UI', Roboto, Arial, sans-serif";

        const commentMaxWidth = 1350;
        // const commentLines = await this.wrapText(tempCtx, commentText, commentMaxWidth);
        const bubbleTexts = commentText.split("++");

        let totalBubbleHeight = 0;
        for (let i = 0; i < bubbleTexts.length; i++) {
          const bubbleText = bubbleTexts[i].trim();
          if (!bubbleText) continue;

          const bubbleLines = await this.wrapText(tempCtx, bubbleText, commentMaxWidth);
          const bubblePadding = 54;
          const lineHeight = 84;
          const bubbleHeight = bubbleLines.length * lineHeight + bubblePadding * 2;
          totalBubbleHeight += bubbleHeight + 30;
        }

        let rh = replyImage ? 1200 : 0;
        if (replyImage?.width > 550) { rh = (replyImage?.height + 480); }
        const canvasWidth = commentMaxWidth + 600;
        const canvasHeight = totalBubbleHeight + 480 + 120 + rh;

        let canvas = createCanvas(canvasWidth, canvasHeight);
        let ctx = canvas.getContext("2d");

        const bgAspectRatio = baseImage.width / baseImage.height;
        const canvasAspectRatio = canvasWidth / canvasHeight;

        let bgWidth, bgHeight, bgX, bgY;

        if (bgAspectRatio > canvasAspectRatio) {
          bgHeight = canvasHeight;
          bgWidth = bgHeight * bgAspectRatio;
          bgX = (canvasWidth - bgWidth) / 2;
          bgY = 0;
        } else {
          bgWidth = canvasWidth;
          bgHeight = bgWidth / bgAspectRatio;
          bgX = 0;
          bgY = canvasHeight - bgHeight;
        }

        ctx.drawImage(baseImage, bgX, bgY, bgWidth, bgHeight);

        const t = new Date().toLocaleTimeString([], { timeZone: 'Asia/Dhaka', hour: '2-digit', minute: '2-digit', hour12: true });

        ctx.font = "530 51px sans-serif";
        ctx.fillStyle = "#FFFFFF";
        const timeTextWidth = ctx.measureText(t).width;
        const timeX = (canvasWidth - timeTextWidth) / 2;
        const timeY = 120;
        ctx.fillText(t, timeX, timeY);

        let contentYOffset = 0;
        if (replyImage) {
          const maxImageWidth = 1450;
          const maxImageHeight = 1200;
          let imageWidth = replyImage.width + 900;
          let imageHeight = replyImage.height + 900;

          const aspectRatio = replyImage.width / replyImage.height;
          if (imageWidth > maxImageWidth) {
            imageWidth = 1450;
            imageHeight = (replyImage.height + 480);
          }
          if (imageHeight > maxImageHeight) {
            imageHeight = maxImageHeight;
            imageWidth = imageHeight * aspectRatio;
          }

          const imageX = 305;
          const imageY = 280;

          ctx.save();
          ctx.beginPath();
          ctx.roundRect(imageX, imageY, imageWidth, imageHeight, [90, 90, 90, 24]);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(replyImage, imageX, imageY, imageWidth, imageHeight);
          ctx.restore();

          contentYOffset = imageHeight - 10;
        }

        const commentX = 375;
        const commentY = (360 + contentYOffset) + gapAdjust;

        const nameMaxWidth = canvas.width - 120;
        const nameX = 345;
        const nameY = 260 + gapAdjust;
        ctx.font = "540 75px 'Segoe UI', Roboto, Arial, sans-serif";
        ctx.fillStyle = "#FFFFFF";

        const nameLines = await this.wrapText(ctx, mentionedName, nameMaxWidth);

        let bubbleYOffset = 0;
        for (let i = 0; i < bubbleTexts.length; i++) {
          const bubbleText = bubbleTexts[i].trim();
          if (!bubbleText) continue;

          const bubbleLines = await this.wrapText(ctx, bubbleText, commentMaxWidth);
          const bubblePadding = 54;
          const lineHeight = 84;
          const bubbleMaxWidth = commentMaxWidth + 105;
          const longestLineWidth = Math.max(...bubbleLines.map(line => line.width));
          const bubbleWidth = Math.min(longestLineWidth + 135, bubbleMaxWidth);
          const bubbleHeight = bubbleLines.length * lineHeight + bubblePadding * 2;

          const bubbleX = commentX - 72;
          const bubbleY = commentY - 60 + bubbleYOffset;

          let fills = "rgba(51, 51, 51, 1.0)";
          let strokes = "rgba(51, 51, 51, 1.0)";
          if (bn === "2") { 
            fills = "rgba(0,0,96,1)";
            strokes = "rgba(0,0,96,1)";
          }
          ctx.fillStyle = fills;
          ctx.strokeStyle = strokes;
          ctx.lineWidth = 0;
          ctx.beginPath();

          if (replyImage) { 
            if (bubbleTexts.length === 1) {
              ctx.roundRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight, [24, 99, 99, 99]);
            } else if (i === 0) {
              ctx.roundRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight, [24, 99, 99, 24]);
            } else if (i === bubbleTexts.length - 1) {
              ctx.roundRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight, [24, 99, 99, 99]);
            } else {
              ctx.roundRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight, [24, 99, 99, 24]);
            }
          } else {
            if (bubbleTexts.length === 1) {
              ctx.roundRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight, [99, 99, 99, 99]);
            } else if (i === 0) {
              ctx.roundRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight, [99, 99, 99, 24]);
            } else if (i === bubbleTexts.length - 1) {
              ctx.roundRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight, [24, 99, 99, 99]);
            } else {
              ctx.roundRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight, [24, 99, 99, 24]);
            }
          }

          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = "#FFFFFF";
          let textYOffset = 0;
          for (const line of bubbleLines) {
            await drawTextWithEmojis(ctx, line.text, commentX, bubbleY + bubblePadding + textYOffset + (lineHeight * 0.75));
            textYOffset += lineHeight;
          }
          bubbleYOffset += bubbleHeight + 12;
        }

        ctx.font = "400 57px 'Segoe UI', Roboto, Arial, sans-serif";
        ctx.fillStyle = "#FFFFFF";
        nameLines.forEach((line, index) => {
          ctx.fillText(line.text, nameX, nameY + index * 84);
        });

        const avatarX = 60;
        const avatarY = canvasHeight - 510 - (replyImage ? 0 : 0);
        const avatarWidth = 150;
        const avatarHeight = 150;

        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarX + avatarWidth / 2, avatarY + avatarHeight / 2, avatarWidth / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(baseAvt1, avatarX, avatarY, avatarWidth, avatarHeight);
        ctx.restore();

        const clonedAvatarX = canvasWidth - 120;
        const clonedAvatarY = canvasHeight - 375 - (replyImage ? 0 : 0);
        const clonedAvatarWidth = 75;
        const clonedAvatarHeight = 75;

        ctx.save();
        ctx.beginPath();
        ctx.arc(clonedAvatarX + clonedAvatarWidth / 2, clonedAvatarY + clonedAvatarHeight / 2, clonedAvatarWidth / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(baseAvt2, clonedAvatarX, clonedAvatarY, clonedAvatarWidth, clonedAvatarHeight);
        ctx.restore();

        const imageBuffer = canvas.toBuffer();
        fs.writeFileSync(pathImg, imageBuffer);
        return api.sendMessage({ attachment: fs.createReadStream(pathImg) },
          event.threadID, event.messageID);
      },
    };