const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
    config: {
        name: "anime2",
        aliases: [],
        version: "1.0",
        author: "Fahim_Noob",
        countDown: 0,
        role: 0,
        shortDescription: "Get random anime content",
        longDescription: "Get random anime content from various categories.",
        category: "anime",
        guide: "{pn} {{<name>}}"
    },

    onStart: async function ({ message, args }) {
        const categories = [
            'waifu', 'marin-kitagawa', 'mori-calliope', 'raiden-shogun', 'oppai', 
            'selfies', 'uniform', 'kamisato-ayaka', 'ass', 'hentai', 'milf', 
            'oral', 'paizuri', 'ecchi', 'ero'
        ];
        const name = args.join(" ");

        if (!name) {
            message.reply(`Please type a category. Available categories: ${categories.join(', ')}`);
        } else if (categories.includes(name)) {
            try {
                let res = await axios.get(`https://team-calyx.onrender.com/anime/v3/${name}`);
                let res2 = res.data;
                let imgUrl = res2.images[0]?.url;

                if (imgUrl) {
                    const downloadsDir = path.resolve(__dirname, 'downloads');
                    if (!fs.existsSync(downloadsDir)) {
                        fs.mkdirSync(downloadsDir);
                    }
                    const imagePath = path.join(downloadsDir, `${name}.jpeg`);

                    const writer = fs.createWriteStream(imagePath);
                    const response = await axios({
                        url: imgUrl,
                        method: 'GET',
                        responseType: 'stream'
                    });

                    response.data.pipe(writer);

                    writer.on('finish', () => {
                        console.log('File downloaded successfully');
                        message.reply({
                            body: 'Here is your downloaded image:',
                            attachment: fs.createReadStream(imagePath)
                        });
                    });

                    writer.on('error', (err) => {
                        console.error('Error writing file:', err);
                        message.reply('Failed to download image.');
                    });
                } else {
                    message.reply('No image found for this category.');
                }
            } catch (e) {
                console.error('Error fetching image:', e);
                message.reply('An error occurred while fetching the image.');
            }
        } else {
            message.reply('Invalid category. Please choose from: ' + categories.join(', '));
        }
    }
};