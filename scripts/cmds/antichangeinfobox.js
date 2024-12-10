const { getStreamFromURL, uploadImgbb } = global.utils;

module.exports = {
	config: {
		name: "antichangeinfobox",
		version: "1.9",
		author: "NTKhang",
		countDown: 5,
		role: 0,
		description: {
			vi: "Bật tắt chức năng chống thành viên đổi thông tin box chat của bạn",
			en: "Turn on/off anti change info box"
		},
		category: "box chat",
		guide: {
			vi: "   {pn} avt [on | off]: chống đổi avatar box chat"
				+ "\n   {pn} name [on | off]: chống đổi tên box chat"
				+ "\n   {pn} nickname [on | off]: chống đổi nickname trong box chat"
				+ "\n   {pn} theme [on | off]: chống đổi theme (chủ đề) box chat"
				+ "\n   {pn} emoji [on | off]: chống đổi trạng emoji box chat",
			en: "   {pn} avt [on | off]: anti change avatar box chat"
				+ "\n   {pn} name [on | off]: anti change name box chat"
				+ "\n   {pn} nickname [on | off]: anti change nickname in box chat"
				+ "\n   {pn} theme [on | off]: anti change theme box chat"
				+ "\n   {pn} emoji [on | off]: anti change emoji box chat"
		}
	},

	langs: {
		vi: {
			antiChangeAvatarOn: "Đã bật chức năng chống đổi avatar box chat",
			antiChangeAvatarOff: "Đã tắt chức năng chống đổi avatar box chat",
			antiChangeNameOn: "Đã bật chức năng chống đổi tên box chat",
			antiChangeNameOff: "Đã tắt chức năng chống đổi tên box chat",
			antiChangeNicknameOn: "Đã bật chức năng chống đổi nickname box chat",
			antiChangeNicknameOff: "Đã tắt chức năng chống đổi nickname box chat",
			antiChangeThemeOn: "Đã bật chức năng chống đổi theme box chat",
			antiChangeThemeOff: "Đã tắt chức năng chống đổi theme box chat",
			antiChangeEmojiOn: "Đã bật chức năng chống đổi emoji box chat",
			antiChangeEmojiOff: "Đã tắt chức năng chống đổi emoji box chat",
		},
		en: {
			antiChangeAvatarOn: "Turn on anti change avatar box chat",
			antiChangeAvatarOff: "Turn off anti change avatar box chat",
			antiChangeNameOn: "Turn on anti change name box chat",
			antiChangeNameOff: "Turn off anti change name box chat",
			antiChangeNicknameOn: "Turn on anti change nickname box chat",
			antiChangeNicknameOff: "Turn off anti change nickname box chat",
			antiChangeThemeOn: "Turn on anti change theme box chat",
			antiChangeThemeOff: "Turn off anti change theme box chat",
			antiChangeEmojiOn: "Turn on anti change emoji box chat",
			antiChangeEmojiOff: "Turn off anti change emoji box chat",
		}
	},

	onStart: async function ({ message, event, args, threadsData, getLang }) {
		if (!["on", "off"].includes(args[1]))
			return message.SyntaxError();

		const { threadID } = event;
		const dataAntiChangeInfoBox = await threadsData.get(threadID, "data.antiChangeInfoBox", {});
		
		async function checkAndSaveData(key, data) {
			if (args[1] === "off")
				delete dataAntiChangeInfoBox[key];
			else
				dataAntiChangeInfoBox[key] = data;

			await threadsData.set(threadID, dataAntiChangeInfoBox, "data.antiChangeInfoBox");
			
			// Send message only when command is triggered, not during changes
			if (args[1] === "on") {
				message.reply(getLang(`antiChange${key.slice(0, 1).toUpperCase()}${key.slice(1)}On`));
			} else {
				message.reply(getLang(`antiChange${key.slice(0, 1).toUpperCase()}${key.slice(1)}Off`));
			}
		}

		switch (args[0]) {
			case "avt":
			case "avatar":
			case "image": {
				const { imageSrc } = await threadsData.get(threadID);
				if (!imageSrc)
					return message.reply(getLang("missingAvt"));
				const newImageSrc = await uploadImgbb(imageSrc);
				await checkAndSaveData("avatar", newImageSrc.image.url);
				break;
			}
			case "name": {
				const { threadName } = await threadsData.get(threadID);
				await checkAndSaveData("name", threadName);
				break;
			}
			case "nickname": {
				const { members } = await threadsData.get(threadID);
				await checkAndSaveData("nickname", members.map(user => ({ [user.userID]: user.nickname })).reduce((a, b) => ({ ...a, ...b }), {}));
				break;
			}
			case "theme": {
				const { threadThemeID } = await threadsData.get(threadID);
				await checkAndSaveData("theme", threadThemeID);
				break;
			}
			case "emoji": {
				const { emoji } = await threadsData.get(threadID);
				await checkAndSaveData("emoji", emoji);
				break;
			}
			default: {
				return message.SyntaxError();
			}
		}
	},

	onEvent: async function ({ event, threadsData, role, api }) {
		const { threadID, logMessageType, logMessageData, author } = event;

		switch (logMessageType) {
			case "log:thread-image": {
				const dataAntiChange = await threadsData.get(threadID, "data.antiChangeInfoBox", {});
				if (!dataAntiChange.avatar || role < 1)
					return;
				if (role < 1 && api.getCurrentUserID() !== author) {
					api.changeGroupImage(await getStreamFromURL(dataAntiChange.avatar), threadID);
				}
				break;
			}
			case "log:thread-name": {
				const dataAntiChange = await threadsData.get(threadID, "data.antiChangeInfoBox", {});
				if (!dataAntiChange.name || role < 1)
					return;
				if (role < 1 && api.getCurrentUserID() !== author) {
					api.setTitle(dataAntiChange.name, threadID);
				}
				break;
			}
			case "log:user-nickname": {
				const dataAntiChange = await threadsData.get(threadID, "data.antiChangeInfoBox", {});
				if (!dataAntiChange.nickname || role < 1)
					return;
				const { participant_id } = logMessageData;
				if (role < 1 && api.getCurrentUserID() !== author) {
					api.changeNickname(dataAntiChange.nickname[participant_id], threadID, participant_id);
				}
				break;
			}
			case "log:thread-color": {
				const dataAntiChange = await threadsData.get(threadID, "data.antiChangeInfoBox", {});
				if (!dataAntiChange.theme || role < 1)
					return;
				if (role < 1 && api.getCurrentUserID() !== author) {
					api.changeThreadColor(dataAntiChange.theme || "196241301102133", threadID); // 196241301102133 is default color
				}
				break;
			}
			case "log:thread-icon": {
				const dataAntiChange = await threadsData.get(threadID, "data.antiChangeInfoBox", {});
				if (!dataAntiChange.emoji || role < 1)
					return;
				if (role < 1 && api.getCurrentUserID() !== author) {
					api.changeThreadEmoji(dataAntiChange.emoji, threadID);
				}
				break;
			}
		}
	}
};