const axios = require('axios');

module.exports = {
	config: {
		name: "waifu",
		aliases: ["wife"],
		version: "1.0",
		author: "Unknown | Fahim_Noob", //Api Modifide by Fahim_Noob
		countDown: 0,
		role: 0,
		shortDescription: "get random waifu",
		longDescription: "Get waifu neko: waifu, neko, shinobu, megumin, bully, cuddle, cry, kiss, lick, hug, awoo, pat, smug, bonk, yeet, blush, smile, wave, highfive, handhold, nom, bite, glomp, slap, kill, kick, happy, wink, poke, dance, cringe",
		category: "anime",
		guide: "{pn} {{<name>}}"
	},

	onStart: async function ({ message, args }) {
		const name = args.join(" ");
		if (!name) {
			try {
				let res = await axios.get('https://smfahim.onrender.com/fetch/waifu');
				let res2 = res.data;
				let img = res2.url;

				const form = {
					body: `   「 𝔀𝓪𝓲𝓯𝓾 」   `
				};
				if (img)
					form.attachment = await global.utils.getStreamFromURL(img);
				message.reply(form);
			} catch (e) {
				message.reply('Not Found');
			}
		} else {
			try {
				let res = await axios.get(`https://smfahim.onrender.com/fetch/waifu/${name}`);
				let res2 = res.data;
				let img1 = res2.url;

				const form = {
					body: `   「 𝔀𝓪𝓲𝓯𝓾 」   `
				};
				if (img1)
					form.attachment = await global.utils.getStreamFromURL(img1);
				message.reply(form);
			} catch (e) {
				message.reply('No waifu category: waifu, neko, shinobu, megumin, bully, cuddle, cry, kiss, lick, hug, awoo, pat, smug, bonk, yeet, blush, smile, wave, highfive, handhold, nom, bite, glomp, slap, kill, kick, happy, wink, poke, dance, cringe');
			}
		}
	}
};
