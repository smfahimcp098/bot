const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "pairdp",
    aliases: [],
    version: "1.0",
    author: "Team Calyx",
    shortDescription: "Create couple matching profile pictures",
    longDescription: "Generate a pair of matching profile pictures for couples",
    category: "image",
    guide: {
      en: "{p}pairdp"
    }
  },

  onStart: async function ({ message, event, args, api }) {
    try {
      // Ensure the command is a reply to a single image message
      if (event.type !== "message_reply") {
        return message.reply("❌ || Please reply to a single image to create a matching pair DP.");
      }

      const attachment = event.messageReply.attachments;
      if (!attachment || attachment.length !== 1 || attachment[0].type !== "photo") {
        return message.reply("❌ || Please reply to a single image to create a matching pair DP.");
      }

      const imageUrl = attachment[0].url;
      const image = await loadImage(imageUrl);

      // Canvas setup for left and right split images
      const width = image.width;
      const height = image.height;
      const halfWidth = width / 2;

      const canvasLeft = createCanvas(halfWidth, height);
      const ctxLeft = canvasLeft.getContext('2d');
      ctxLeft.drawImage(image, 0, 0, halfWidth, height, 0, 0, halfWidth, height);

      const canvasRight = createCanvas(halfWidth, height);
      const ctxRight = canvasRight.getContext('2d');
      ctxRight.drawImage(image, halfWidth, 0, halfWidth, height, 0, 0, halfWidth, height);

      // Ensure cache folder exists for saving temporary images
      const cacheFolderPath = path.join(__dirname, 'cache');
      if (!fs.existsSync(cacheFolderPath)) {
        fs.mkdirSync(cacheFolderPath);
      }

      const timestamp = Date.now();
      const leftImagePath = path.join(cacheFolderPath, `${timestamp}_left.png`);
      const rightImagePath = path.join(cacheFolderPath, `${timestamp}_right.png`);

      // Save images to disk
      await Promise.all([
        saveCanvasToFile(canvasLeft, leftImagePath),
        saveCanvasToFile(canvasRight, rightImagePath)
      ]);

      // Send the generated pair DP images
      message.reply({
        body: "✨ Here are your matching profile pictures! Enjoy!",
        attachment: [
          fs.createReadStream(leftImagePath),
          fs.createReadStream(rightImagePath)
        ]
      });

    } catch (error) {
      console.error("Error:", error);
      message.reply("❌ | Oops! Something went wrong while creating the pair DP.");
    }
  }
};

// Helper function to save canvas to a file
function saveCanvasToFile(canvas, filePath) {
  return new Promise((resolve, reject) => {
    const out = fs.createWriteStream(filePath);
    const stream = canvas.createPNGStream();
    stream.pipe(out);
    out.on('finish', resolve);
    out.on('error', reject);
  });
}