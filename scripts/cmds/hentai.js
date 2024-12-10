const axios = require('axios');

module.exports = {
    config: {
        name: "hentai",
        aliases: [],
        version: "1.0",
        author: "Team Calyx",
        countDown: 0,
        role: 0,
        shortDescription: "get random hentai",
        longDescription: "Get hentai category: waifu, neko, trap, blowjob",
        category: "18+",
        guide: "{pn} {{<name>}}"
    },

    onStart: async function ({ message, args }) {
        const categories = [
            'waifu', 'neko', 'trap', 'blowjob'
        ];
        const name = args.join(" ");

        if (!name) {
            message.reply(`Please type a category. Available categories: ${categories.join(', ')}`);
        } else if (categories.includes(name)) {
            try {
                let res = await axios.get(`https://team-calyx.onrender.com/anime/v2/${name}`);
                let res2 = res.data;
                let img1 = res2.url;

                const form = {
                    body: `Here is your hentai image`
                };
                if (img1)
                    form.attachment = await global.utils.getStreamFromURL(img1);
                message.reply(form);
            } catch (e) {
                message.reply('Not Found');
            }
        } else {
            message.reply('Invalid category. Please choose from: ' + categories.join(', '));
        }
    }
};