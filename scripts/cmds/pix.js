const axios = require("axios");
const path = require("path");
const fs = require("fs");

module.exports = {
	config: {
		name: "pix",
		version: "1.1",
		author: "Yeasin",
		countDown: 5,
		role: 0,
		shortDescription: "Image to animated kiss or hug or other style",
		longDescription: "Convert an image into an animation {create account acc=<number>}",
		category: "ai",
		guide: {
			en: '{pn} acc=<number>: create account\n{pn} refresh: refresh credit\n{pn} sty=number: image animation'
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

		if (update && !isRefreshCommand && !accNumber && !isStyleCommand && !styNumber) {
			const update_link = args[1];
			const file_name = args[2];
			const pythonApiUrl = "https://pixverser.smfahim.xyz/update_file";

			try {
				const apiResponse = await axios.post(pythonApiUrl, null, {
					params: {
						file_link: update_link,
						file_name: file_name
					}
				});
				const file_upload_link = apiResponse.data.file_upload_link;
				return api.sendMessage(`File updated successfully. New file link: ${file_upload_link}`, event.threadID, event.messageID);
			} catch (error) {
				console.error("Update API error:", error.message);
				return api.sendMessage("Update failed. Please try again later.", event.threadID, event.messageID);
			}
		}

		if (isRefreshCommand && !accNumber && !isStyleCommand && !styNumber) {
			const pythonApiUrl = "https://pixverser.smfahim.xyz/image_pixserver_refresh";
			try {
				const apiResponse = await axios.get(pythonApiUrl);
				const { nonzero_accounts, zero_accounts, total_credit_sum, file_upload_link, file_upload_link2 } = apiResponse.data.output;
				const total_account_number = nonzero_accounts + zero_accounts;
				const replyMessage =
`Refresh Completed:

Total Accounts: ${total_account_number}
Valid Accounts: ${nonzero_accounts}
Zero Accounts: ${zero_accounts}
Total Credit Sum: ${total_credit_sum}

File account link: ${file_upload_link}
File style link: ${file_upload_link2}`;
				return message.reply(replyMessage);
			} catch (error) {
				console.error("Refresh API error:", error.message);
				return message.reply("Refresh failed. Please try again later.");
			}
		}

		if (accNumber && !isStyleCommand && !isRefreshCommand && !styNumber) {
			const pythonApiUrl = "https://pixverser.smfahim.xyz/automation_account";
			const apiResponse = await axios.post(pythonApiUrl, { number: accNumber });
			const details = apiResponse.data.details;
			const logdata = apiResponse.data;
			if (!details || details.length === 0) {
				return message.reply("No account details found.");
			}
			let formattedDetails = details.map(acc =>
				`Username: ${acc.Username}
Account ID: ${acc.AccountId}
Token: ${acc.Token}
Total Credit: ${acc.TotalCredit}
Iteration: ${acc.iteration}`
			).join("\n--------------------\n");

			return message.reply(`Account Details:\n\n${formattedDetails}\n\nFile account link: ${logdata.file_upload_link}\nFile style link: ${logdata.file_upload_link2}`);
		}

		if (isStyleCommand && !styNumber && !accNumber && !isRefreshCommand) {
			const pythonStyleApi = "https://pixverser.smfahim.xyz/style_pixserver";
			const styleResponse = await axios.get(pythonStyleApi);
			const styles = styleResponse.data.style_name;
			if (!styles || styles.length === 0) {
				return api.sendMessage("No styles available.", event.threadID, event.messageID);
			}
			const formattedStyles = styles.map((style, index) => `${index + 1}. ${style}`).join("\n");
			return api.sendMessage(`Available Styles:\n${formattedStyles}`, event.threadID, event.messageID);
		}

		if (!styNumber) {
			return api.sendMessage("Please provide a style number. Example: sty=1", event.threadID, event.messageID);
		}
		if (event.type !== "message_reply" || !event.messageReply.attachments || event.messageReply.attachments.length === 0) {
			return api.sendMessage("You must reply to a photo.", event.threadID, event.messageID);
		}
		styNumber = parseInt(styNumber);
		if (isNaN(styNumber) || styNumber <= 0) {
			return api.sendMessage("Invalid style number. Please provide a valid number.", event.threadID, event.messageID);
		}

		const pythonStyleApi = "https://pixverser.smfahim.xyz/style_pixserver";
		const styleResponse = await axios.get(pythonStyleApi);
		const styles = styleResponse.data.style_name;
		if (!styles || styles.length === 0) {
			return api.sendMessage("No styles available.", event.threadID, event.messageID);
		}
		if (styNumber > styles.length) {
			return api.sendMessage(`Invalid style number. Please select a number between 1 and ${styles.length}.`, event.threadID, event.messageID);
		}
		const selectedStyle = styles[styNumber - 1];
		const imageUrl = event.messageReply.attachments[0].url;
		const tempDir = path.join(__dirname, '/tmp');
		if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
		const randomImageName = `image-${Date.now()}.jpg`;
		const imageSavePath = path.join(tempDir, randomImageName);

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

		const imagePixserverUrl = "https://pixverser.smfahim.xyz/image_pixserver";
		const pixserverResponse = await axios.get(imagePixserverUrl, {
			params: { file: imageUrl, style: styNumber }
		});

		const { video_url, total_accounts, total_credit, last_time_credit } = pixserverResponse.data;
		if (!video_url) {
			return api.sendMessage("Video URL not found from API response.", event.threadID, event.messageID);
		}

		const messageBody =
`Your animated video using style: ${selectedStyle}

Account Summary:
Total Accounts: ${total_accounts}
Total Credit: ${total_credit}
End Token: ${last_time_credit}`;

		const randomVideoName = `video-${Date.now()}.mp4`;
		const videoSavePath = path.join(tempDir, randomVideoName);

		const downloadVideoWithRetry = async (url, savePath, retries = 10, delay = 60000) => {
			for (let attempt = 1; attempt <= retries; attempt++) {
				try {
					const response = await axios({ method: 'GET', url, responseType: 'stream' });
					return new Promise((resolve, reject) => {
						const writer = fs.createWriteStream(savePath);
						response.data.pipe(writer);
						writer.on('finish', () => resolve(savePath));
						writer.on('error', reject);
					});
				} catch (error) {
					if (attempt < retries) {
						await new Promise(resolve => setTimeout(resolve, delay));
					} else {
						throw new Error("Maximum retry attempts reached.");
					}
				}
			}
		};

		const decodedVideoUrl = decodeURIComponent(video_url);

		try {
			await downloadVideoWithRetry(decodedVideoUrl, videoSavePath);
			const attachment = fs.createReadStream(videoSavePath);
			await api.sendMessage({ body: messageBody, attachment }, event.threadID, event.messageID);
			fs.unlink(videoSavePath, err => { if (err) console.error("Error deleting video file:", err); });
			fs.unlink(imageSavePath, err => { if (err) console.error("Error deleting image file:", err); });
		} catch (error) {
			console.error("Final video download failed:", error.message);
			api.sendMessage("Video download failed after multiple attempts. Please try again later.", event.threadID, event.messageID);
		}
	}
};
