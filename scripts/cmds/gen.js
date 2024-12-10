const axios = require('axios');
const fs = require("fs-extra");
const path = require('path');

module.exports = {
    config: {
        name: "gen",
        version: "1.0",
        author: "Team Calyx",
        category: "𝗔𝗜",
        shortDescription: "Generate an image",
        longDescription: "Generates an image based on the provided prompt.",
        guide: "{pn} <prompt>",
    },

    onStart: async function ({ event, message, args }) {
        if (args.length === 0) {
            return message.reply("Please provide a prompt. Usage: -gen <prompt>");
        }

        const prompt = args.join(" ");
        const apiUrl = `http://45.90.12.34:5047/gen?prompt=${encodeURIComponent(prompt)}`;

        try {
           
            const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });

            const imagePath = path.join(__dirname, 'tmp', `generated_${Date.now()}.jpg`);
            fs.writeFileSync(imagePath, Buffer.from(response.data, 'utf-8'));

            const imageStream = fs.createReadStream(imagePath);
            message.reply({ attachment: imageStream }, () => {
                fs.unlinkSync(imagePath);
            });

        } catch (error) {
            console.error("Error fetching the image:", error);
            message.reply("❌ Failed to generate image. Please try again later.");
        }
    }
};