const fs = require('fs');
const axios = require('axios');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');

module.exports = {
	config: {
		name: "gflink",
		version: "1.0",
		author: "Yeasin",
		countDown: 5,
		role: 0,
		shortDescription: "download audio or video",
		longDescription: "download audio or video",
		category: "custom",
		guide: "{pm} link"
	},
	onStart: async function () {},
	onChat: async function ({ event, message, threadsData, commandName }) {
        try {
            const urlRegx = /https:\/\/[^\s]+/;
            if (event.body) {
                const match = event.body.match(urlRegx);

                if (match) {
                    const prefix = await global.utils.getPrefix(event.threadID);
                    if (event.body.startsWith(prefix)) return;

                    const url = match[0];

                    return message.reply({
                        body: `🔗 Media link detected!\nReact with 👍 to start the download!`
                    }, (err, info) => {
                        global.GoatBot.onReaction.set(info.messageID, {
                            commandName,
                            messageID: info.messageID,
                            urlmsgID: event.messageID,
                            author: event.senderID,
                            url
                        });
                        setTimeout(() => {
                            try {
                                message.unsend(info.messageID);
                            } catch (e) { }
                        }, 60000);
                    });
                }
            }
        } catch (e) {
            console.log(e)
        }
    },

    onReaction: async ({ event, api, Reaction, message }) => {
        const { author, url, messageID, urlmsgID } = Reaction;
        const { userID, reaction } = event;
        if (author != userID) return;
        
        async function downloadVideo(api, event, link) {
			const tmpDir = path.join(__dirname, '/tmp');							
			const downloadUrlEndpoint = `http://127.0.0.1:5001/allLink?link=${encodeURIComponent(link)}`;
			const respo = await axios.get(downloadUrlEndpoint);
			const downloadUrl = respo.data.download_url;
			if (downloadUrl) {
				const randomId = Math.floor(Math.random() * 10000) + "_" + Date.now();
				const videoPath = path.join(tmpDir, `gf_link_video_${randomId}.mp4`);
				const videoResponse = await axios.get(downloadUrl, {
					responseType: "arraybuffer"
				});
				fs.writeFileSync(videoPath, Buffer.from(videoResponse.data));
				console.log(`Video saved as: ${videoPath}`);			
				const stats = fs.statSync(videoPath);
				const fileSizeMB = stats.size / (1024 * 1024); // Convert bytes to MB
				api.setMessageReaction("✔", event.messageID, (err) => {}, true);
				if (fileSizeMB > 80) {				
					ffmpeg.ffprobe(videoPath, async (err, metadata) => {
						if (err) throw new Error("Error reading video metadata");
						const duration = metadata.format.duration;
						const splitDuration = Math.ceil((duration / Math.ceil(fileSizeMB / 80)));					
						const parts = [];
						for (let i = 0; i < duration; i += splitDuration) {
							const partPath = path.join(tmpDir, `gf_link_video_${randomId}_part_${i}.mp4`);
							parts.push(partPath);
							await new Promise((resolve, reject) => {
								ffmpeg(videoPath)
								.setStartTime(i)
								.setDuration(splitDuration)
								.output(partPath)
								.on('end', () => resolve())
								.on('error', reject)
								.run();
							});
							console.log(`Created part: ${partPath}`);
						}
						for (const part of parts) {
							const attachment = fs.createReadStream(part);
							await api.sendMessage(
								{
									body: `Here's a part ${part} of your video`, attachment: attachment
								},
								event.threadID
							);
							console.log(`Sent part: ${part}`);
						}					
						fs.unlinkSync(videoPath);
						parts.forEach(part => fs.unlinkSync(part));
					});
				} else {
					const attachment = fs.createReadStream(videoPath);
					await api.sendMessage(
						{
							body: "Here's your video:", attachment: attachment
						},
						event.threadID
					);
					console.log("Sent original video.");
					fs.unlinkSync(videoPath);
				}
			} else {
				console.error('Failed to retrieve download URL');
			}
	    }
        try {
            if (reaction == "👍") {
                await api.editMessage(`⌛ Downloading...`, messageID);
                message.reaction("⌛", urlmsgID);                
                const link = url;
                const supportFileList = "https://raw.githubusercontent.com/yt-dlp/yt-dlp/refs/heads/master/supportedsites.md";        
                const linkPartMatch = link.match(/\/\/([^\/]+)/);
                const linkPart = linkPartMatch ? linkPartMatch[1] : null;           
                if (!linkPart) {
                    await api.sendMessage(`Invalid link format ${link}`, event.threadID);
                    return;
                } 
                const response = await axios.get(supportFileList);
                const supportedSites = response.data;          
                const isSupported = supportedSites.split('\n').some(site => linkPart.includes(site.trim()));
                if (isSupported) {             
                    console.log("Link is supported, proceeding with download...");
                    await downloadVideo(api, event, link);  
                } else {
                    console.log("Link is not supported.");
                    await api.sendMessage(
                        "The provided link is not supported.",
                        event.threadID
                    );
                }
            }
        }
        catch (err) {
            console.log("error" + err)
        }
    }
};