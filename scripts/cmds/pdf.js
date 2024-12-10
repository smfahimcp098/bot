const fs = require('fs');
const path = require('path');
const axios = require('axios');
const PDFDocument = require('pdfkit');

const cacheFolder = path.join(__dirname, 'cache');
if (!fs.existsSync(cacheFolder)) {
  fs.mkdirSync(cacheFolder);
}

module.exports = {
  config: {
    name: "pdf",
    version: "1.0",
    author: "Team Calyx",
    shortDescription: "Convert images to PDF",
    longDescription: "Combine multiple images into a single PDF document.",
    category: "image",
    guide: {
      en: "!pdf <name>"
    }
  },

  onStart: async function ({ message, event, args, api }) {
    try {
      // Verify the command is used by replying to images
      if (event.type !== "message_reply") {
        return message.reply("❌ | Please reply to multiple images to convert them to a PDF.");
      }

      const attachments = event.messageReply.attachments;
      if (!attachments || attachments.length < 2 || !attachments.every(attachment => attachment.type === "photo")) {
        return message.reply("❌ | Please reply to at least two images to create a PDF.");
      }

      const pdfName = args[0];
      if (!pdfName) {
        return message.reply("❌ | You forgot to provide a name for the PDF! Please specify a name.");
      }

      const imagePaths = [];

      for (let i = 0; i < attachments.length; i++) {
        const imageUrl = attachments[i].url;
        const imagePath = path.join(cacheFolder, `image_${i}_${Date.now()}.jpg`);
        imagePaths.push(imagePath);

        const responseImage = await axios({
          url: imageUrl,
          method: 'GET',
          responseType: 'stream'
        });
        const writerImage = fs.createWriteStream(imagePath);
        responseImage.data.pipe(writerImage);

        await new Promise((resolve, reject) => {
          writerImage.on('finish', resolve);
          writerImage.on('error', reject);
        });
      }

      const pdfPath = path.join(cacheFolder, `${pdfName}.pdf`);
      const doc = new PDFDocument();
      const pdfWriter = fs.createWriteStream(pdfPath);
      doc.pipe(pdfWriter);

      for (const imagePath of imagePaths) {
        doc.addPage().image(imagePath, {
          fit: [500, 700],
          align: 'center',
          valign: 'center'
        });
      }

      doc.end();

      await new Promise((resolve, reject) => {
        pdfWriter.on('finish', resolve);
        pdfWriter.on('error', reject);
      });

      const pdfStream = fs.createReadStream(pdfPath);

      await api.sendMessage({
        body: `📄 | Your PDF is ready! Tap to download and view 📥`,
        attachment: pdfStream
      }, event.threadID);

      imagePaths.forEach(imagePath => fs.unlinkSync(imagePath));

    } catch (error) {
      console.error("Error:", error);
      message.reply("❌ | Oops! Something went wrong while creating the PDF.");
    }
  }
};