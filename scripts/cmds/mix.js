const axios = require('axios');
const fs = require("fs-extra");
const path = require('path');

module.exports = {
    config: {
    name: 'mix',
    version: '1.0', 
    role: 2,
    countDown: 5,
    author: 'Team_Calyx| NOVA | Api modified by Fahim_Noob',
    category: '𝗔𝗜',
  },
    onStart: async ({ event, message, api, args }) => {
        let prompt = args.join(' ') || ' ';
        let ratio = "1:1";
        let weight = 0.9;

        args.forEach(arg => {
            if (arg.startsWith("--ar=")) {
                ratio = arg.slice(5);
            } else if (arg.startsWith("--weight=")) {
                weight = parseFloat(arg.slice(9));
            }
        });

        let imgurl;
        if (event.messageReply && event.messageReply.attachments[0]?.type === 'photo') {
            imgurl = event.messageReply.attachments[0].url;
        }
 							const noobs = 'xyz';

        const endpoint = imgurl
            ? `/tensor/mix?prompt=${encodeURIComponent(prompt)}&ratio=${ratio}&weight=${weight}&imgurl=${encodeURIComponent(imgurl)}`
            : `/tensor/mix?prompt=${encodeURIComponent(prompt)}&ratio=${ratio}&weight=${weight}`;

        try {
            message.reaction('⏳', event.messageID);
            const response = await axios.get(`https://smfahim.${noobs}${endpoint}`);

            if (response.data.success) {
                const imageURL = response.data.imageUrl;
                const imagePath = path.join(__dirname, 'tmp', `image_${Date.now()}.jpg`);
                
  
                const writer = fs.createWriteStream(imagePath);
                const imageResponse = await axios({
                    url: imageURL,
                    method: 'GET',
                    responseType: 'stream'
                });
                imageResponse.data.pipe(writer);

                await new Promise((resolve, reject) => {
                    writer.on('finish', resolve);
                    writer.on('error', reject);
                });

                message.reaction('✅', event.messageID);
                const imageStream = fs.createReadStream(imagePath);
                const responseMessage = { body: 'Mix', attachment: imageStream };
                message.reply(responseMessage, () => fs.unlinkSync(imagePath));

            } else {
                message.reaction('❌', event.messageID);
                message.reply("❌ Failed to generate image. Try Again!.");
            }

        } catch (err) {
            console.error("Error sending request", err);
            message.reaction('❌', event.messageID);
            message.reply(`❌ Error: ${err.message}`); 
        }
    }
};