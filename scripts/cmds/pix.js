const axios = require("axios");
const path = require("path");
const fs = require("fs");

module.exports = {
	config: {
		name: "pix",
		version: "4.0",
		author: "Yeasin",
		countDown: 5,
		role: 2,
		shortDescription: "Image to animated kiss or hug or other style",
		longDescription: "Convert an image into an animation {create account acc=<number>}",
		category: "ai",
		guide: {
			en: '   {pn} acc=<number>: create account '
			+ '\n   {pn} refresh: refresh credit'
			+ '\n   {pn} sty=number: image animation'
		}
	},

	onStart: async function ({ api, event, message, args }) {
		let styNumber = null;
		let isStyleCommand = false;
		let accNumber = null;
		let isRefreshCommand = false;
		let update = false;

		args.forEach(arg => {
			if (arg.startsWith("sty=")) styNumber = arg.split("=")[1];
			if (arg.startsWith("style")) isStyleCommand = true;
			if (arg.startsWith("acc=")) accNumber = arg.split("=")[1];
			if (arg.startsWith("refresh")) isRefreshCommand = true;
			if (arg.startsWith("update")) update = true;
		});

		// UPDATE command
		if (update && !isRefreshCommand && !accNumber && !isStyleCommand && !styNumber) {
			const update_link = args[1];
			const file_name = args[2];
			const pythonApiUrl = "https://pixverser.smfahim.xyz/update_file";

			try {
				const apiResponse = await axios.post(pythonApiUrl, null, {
					params: { file_link: update_link, file_name: file_name }
				});
				const file_upload_link = apiResponse.data.file_upload_link;
				return api.sendMessage(`✅ File updated successfully.\nNew file link: ${file_upload_link}`, event.threadID, event.messageID);
			} catch (error) {
				console.error("❌ Update API error:", error.message);
				return api.sendMessage("❌ Update failed. Please try again later.", event.threadID, event.messageID);
			}
		}

		// REFRESH command
		if (isRefreshCommand && !accNumber && !isStyleCommand && !styNumber) {
			const pythonApiUrl = "https://test-flask-yl8n.onrender.com/image_pixserver_refresh";
			try {
				const apiResponse = await axios.get(pythonApiUrl);
				const {
					nonzero_accounts, zero_accounts, total_credit_sum,
					file_upload_link, file_upload_link2
				} = apiResponse.data.output;

				const total_account_number = nonzero_accounts + zero_accounts;
				const replyMessage = `✅ Refresh Completed:\n\nTotal Account: ${total_account_number}\n────────────────────────\n✔️ Valid Accounts (Non-zero): ${nonzero_accounts}\n❌ Zero Accounts: ${zero_accounts}\n💰 Total Credit Sum: ${total_credit_sum}\n📂 File account link: ${file_upload_link}\n📂 File style link: ${file_upload_link2}\n────────────────────────`;

				return message.reply(replyMessage);
			} catch (error) {
				console.error("❌ Refresh API error:", error.message);
				return message.reply("❌ Refresh failed. Please try again later.");
			}
		}

		// ACCOUNT CREATION
		if (accNumber && !isStyleCommand && !isRefreshCommand && !styNumber) {
			const pythonApiUrl = "https://pixverser.smfahim.xyz/automation_account";
			try {
				const apiResponse = await axios.post(pythonApiUrl, { number: accNumber });
				const details = apiResponse.data.details;
				const logdata = apiResponse.data;
				if (!details || details.length === 0) {
					return message.reply("❌ No account details found.");
				}
				const formattedDetails = details.map(acc =>
					`✔️ Username: ${acc.Username}\n🆔 Account ID: ${acc.AccountId}\n🔑 Token: ${acc.Token}\n💰 Total Credit: ${acc.TotalCredit}\n🔁 Iteration: ${acc.iteration}`
				).join("\n────────────────────────\n");

				return message.reply(`✅ API Response:\nAccount Details:\n\n────────────────────────\n${formattedDetails}\n────────────────────────\n📂 File account link: ${logdata.file_upload_link}\n📂 File style link: ${logdata.file_upload_link2}`);
			} catch (error) {
				console.error("❌ Account API error:", error.message);
				return message.reply("❌ Failed to create accounts.");
			}
		}

		// STYLE LISTING
		if (isStyleCommand && !styNumber && !accNumber && !isRefreshCommand) {
			const pythonStyleApi = "https://pixverser.smfahim.xyz/style_pixserver";
			try {
				const styleResponse = await axios.get(pythonStyleApi);
				const styles = styleResponse.data.style_name;
				if (!styles || styles.length === 0) {
					return api.sendMessage("❌ No styles available.", event.threadID, event.messageID);
				}
				const formattedStyles = styles.map((style, index) => `${index + 1}. ${style}`).join("\n");
				return api.sendMessage(`✅ Available Styles:\n${formattedStyles}`, event.threadID, event.messageID);
			} catch (err) {
				console.error("❌ Style listing error:", err.message);
				return api.sendMessage("❌ Couldn't fetch styles.", event.threadID, event.messageID);
			}
		}

		// IMAGE ANIMATION
		if (!styNumber) {
			return api.sendMessage("❌ Please provide a style number. Example: sty=1", event.threadID, event.messageID);
		}
		if (event.type !== "message_reply" || !event.messageReply.attachments || event.messageReply.attachments.length === 0) {
			return api.sendMessage("❌ You must reply to a photo", event.threadID, event.messageID);
		}
		styNumber = parseInt(styNumber);
		if (isNaN(styNumber) || styNumber <= 0) {
			return api.sendMessage("❌ Invalid style number.", event.threadID, event.messageID);
		}

		const pythonStyleApi = "https://pixverser.smfahim.xyz/style_pixserver";
		const styleResponse = await axios.get(pythonStyleApi);
		const styles = styleResponse.data.style_name;
		if (!styles || styles.length === 0 || styNumber > styles.length) {
			return api.sendMessage(`❌ Invalid style number. Choose 1-${styles.length}`, event.threadID, event.messageID);
		}
		const selectedStyle = styles[styNumber - 1];

		// Image download
		const imageUrl = event.messageReply.attachments[0].url;
		const tempDir = path.join(__dirname, '/tmp');
		if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
		const imageSavePath = path.join(tempDir, `image-${Date.now()}.jpg`);
		const downloadImage = async (url, savePath) => {
			const response = await axios({ method: 'GET', url, responseType: 'stream' });
			return new Promise((resolve, reject) => {
				const writer = fs.createWriteStream(savePath);
				response.data.pipe(writer);
				writer.on('finish', () => resolve(savePath));
				writer.on('error', reject);
			});
		};
		await downloadImage(imageUrl, imageSavePath);

		// Call pixserver API
		const imagePixserverUrl = "https://pixverser.smfahim.xyz/image_pixserver";
		const pixserverResponse = await axios.get(imagePixserverUrl, {
			params: { file: imageUrl, style: styNumber }
		});
		const { video_url, total_accounts, total_credit, last_time_credit } = pixserverResponse.data;
		if (!video_url) {
			return api.sendMessage("❌ Animation generation failed.", event.threadID, event.messageID);
		}
		return api.sendMessage({
			body: `✅ Animation Created!\n\n🎞️ Style: ${selectedStyle}\n👥 Accounts Used: ${total_accounts}\n💳 Total Credit: ${total_credit}\n⏳ Last Time Credit: ${last_time_credit}`,
			attachment: await global.utils.getStreamFromURL(video_url)
		}, event.threadID, event.messageID);
	}
};
