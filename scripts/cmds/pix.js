const axios = require("axios");
const path = require("path");
const fs = require("fs");

module.exports = {
	config: {
		name: "pix",
		version: "3",
		author: "Yeasin",
		countDown: 5,
		role: 0,
		shortDescription: "Image to animated kiss or hug or other style",
		longDescription: "Convert an image into an animation {create account acc=<number>}",
		category: "animation",
		guide: {
			en: '   {pn} acc=<number>: create account '
			+ '\n   {pn} refresh: refresh cadit'
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
			const pythonApiUrl = "https://test-flask-yl8n.onrender.com/update_file";

			try {
				const apiResponse = await axios.post(pythonApiUrl, null, {
					params: { file_link: update_link, file_name: file_name }
				});
				const file_upload_link = apiResponse.data.file_upload_link;
				return api.sendMessage(`âœ… File updated successfully. New file link: ${file_upload_link}`, event.threadID, event.messageID);
			} catch (error) {
				console.error("âŒ Update API error:", error.message);
				return api.sendMessage("âŒ Update failed. Please try again later.", event.threadID, event.messageID);
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
				const replyMessage = `âœ… Refresh Completed:\n\nTotal Account: ${total_account_number}\nâ•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—\nðŸ”¹ Valid Accounts (Non-zero): ${nonzero_accounts}\nðŸ”¸ Zero Accounts: ${zero_accounts}\nðŸ’° Total Credit Sum: ${total_credit_sum}\nðŸ“‚File account link: ${file_upload_link}\nðŸ“‚File style link: ${file_upload_link2}\nâ•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•`;

				return message.reply(replyMessage);
			} catch (error) {
				console.error("âŒ Refresh API error:", error.message);
				return message.reply("âŒ Refresh failed. Please try again later.");
			}
		}

		// ACCOUNT CREATION
		if (accNumber && !isStyleCommand && !isRefreshCommand && !styNumber) {
			const pythonApiUrl = "https://test-flask-yl8n.onrender.com/automation_account";
			try {
				const apiResponse = await axios.post(pythonApiUrl, { number: accNumber });
				const details = apiResponse.data.details;
				const logdata = apiResponse.data;
				if (!details || details.length === 0) {
					return message.reply("âŒ No account details found.");
				}
				const formattedDetails = details.map(acc =>
					`ðŸ”¹ Username: ${acc.Username}\nðŸ†” Account ID: ${acc.AccountId}\nðŸ”‘ Token: ${acc.Token}\nðŸ’° Total Credit: ${acc.TotalCredit}\nðŸ”„ Iteration: ${acc.iteration}`
				).join("\nâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•\n");

				return message.reply(`âœ… API Response:\n Account Details:\n\nâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•\n${formattedDetails}\nâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•\nðŸ“‚File account link: ${logdata.file_upload_link}\nðŸ“‚File style link: ${logdata.file_upload_link2}`);
			} catch (error) {
				console.error("âŒ Account API error:", error.message);
				return message.reply("âŒ Failed to create accounts.");
			}
		}

		// STYLE LISTING
		if (isStyleCommand && !styNumber && !accNumber && !isRefreshCommand) {
			const pythonStyleApi = "https://test-flask-yl8n.onrender.com/style_pixserver";
			try {
				const styleResponse = await axios.get(pythonStyleApi);
				const styles = styleResponse.data.style_name;
				if (!styles || styles.length === 0) {
					return api.sendMessage("âŒ No styles available.", event.threadID, event.messageID);
				}
				const formattedStyles = styles.map((style, index) => `${index + 1}. ${style}`).join("\n");
				return api.sendMessage(`âœ… Available Styles:\n${formattedStyles}`, event.threadID, event.messageID);
			} catch (err) {
				console.error("âŒ Style listing error:", err.message);
				return api.sendMessage("âŒ Couldn't fetch styles.", event.threadID, event.messageID);
			}
		}

		// IMAGE ANIMATION
		if (!styNumber) {
			return api.sendMessage("âŒ Please provide a style number. Example: sty=1", event.threadID, event.messageID);
		}
		if (event.type !== "message_reply" || !event.messageReply.attachments || event.messageReply.attachments.length === 0) {
			return api.sendMessage("âŒ You must reply to a photo", event.threadID, event.messageID);
		}
		styNumber = parseInt(styNumber);
		if (isNaN(styNumber) || styNumber <= 0) {
			return api.sendMessage("âŒ Invalid style number.", event.threadID, event.messageID);
		}

		const pythonStyleApi = "https://test-flask-yl8n.onrender.com/style_pixserver";
		const styleResponse = await axios.get(pythonStyleApi);
		const styles = styleResponse.data.style_name;
		if (!styles || styles.length === 0 || styNumber > styles.length) {
			return api.sendMessage(`âŒ Invalid style number. Choose 1-${styles.length}`, event.threadID, event.messageID);
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
		const imagePixserverUrl = "https://test-flask-yl8n.onrender.com/image_pixserver";
		const pixserverResponse = await axios.get(imagePixserverUrl, {
			params: { file: imageUrl, style: styNumber }
		});
		const { video_url, total_accounts, total_credit, last_time_credit } = pixserverResponse.data;
		if (!video_url) {
			return api.sendMessage("âŒ Video URL not found from API response", event.threadID, event.messageID);
		}

		const messageBody = `âœ… Your animated video using style: ${selectedStyle}\n\nðŸ“Š Account Summary:\nðŸ“Œ Total Accounts: ${total_accounts}\nðŸ’° Total Credit: ${total_credit}\nâ±ï¸ End token: ${last_time_credit}`;
		const videoSavePath = path.join(tempDir, `video-${Date.now()}.mp4`);

		// Retry download
		const downloadVideoWithRetry = async (url, savePath, retries = 10, delay = 60000) => {
			for (let attempt = 1; attempt <= retries; attempt++) {
				try {
					console.log(`ðŸ”„ Downloading video... Attempt ${attempt}`);
					const response = await axios({ method: 'GET', url, responseType: 'stream' });
					return new Promise((resolve, reject) => {
						const writer = fs.createWriteStream(savePath);
						response.data.pipe(writer);
						writer.on('finish', () => resolve(savePath));
						writer.on('error', reject);
					});
				} catch (error) {
					console.error(`âŒ Attempt ${attempt} failed: ${error.message}`);
					if (attempt < retries) await new Promise(r => setTimeout(r, delay));
					else throw new Error("âŒ Maximum retry limit reached.");
				}
			}
		};

		try {
			await downloadVideoWithRetry(video_url, videoSavePath);
			return api.sendMessage({
				body: messageBody,
				attachment: fs.createReadStream(videoSavePath)
			}, event.threadID, event.messageID);
		} catch (err) {
			console.error("âŒ Final download error:", err.message);
			return api.sendMessage("âŒ Failed to download video. Please try again later.", event.threadID, event.messageID);
		}
	}
};
