const axios = require("axios");

module.exports = {
  config: {
    name: "o1",
    aliases: [],
    version: "1.0",
    author: "Team Calyx",
    countDown: 10,
    role: 0,
    longDescription: {
      en: "Generate a Ghibli-style image. If you reply to a message containing an image, that image URL will be sent as `imageUrl` to the API."
    },
    category: "image",
    guide: {
      en: "{pn} <prompt>\n\n• To use your own image: reply to a message with an image, then run:\n  {pn} your prompt here\n\n• If no reply‐image, it will send only the text prompt."
    }
  },

  onStart: async function ({ message, api, args, event }) {
    const promptText = args.join(" ").trim();
    if (!promptText) {
      return message.reply(
        `⚠️ Please provide a text prompt.\n\nExample:\n${global.GoatBot.config.prefix}o1 a cat\n\nOr reply to an image with:\n${global.GoatBot.config.prefix}o1 describe this scene`
      );
    }

    // 기본 promptPayload 설정
    let apiUrl = "";
    const encodedPrompt = encodeURIComponent(promptText);

    // 만약 리플라이한 메시지에 이미지가 있으면 imageUrl 파라미터 추가
    if (
      event.messageReply &&
      event.messageReply.attachments &&
      event.messageReply.attachments[0] &&
      event.messageReply.attachments[0].url
    ) {
      const rawImgUrl = event.messageReply.attachments[0].url;
      const encodedImg = encodeURIComponent(rawImgUrl);
      apiUrl = `https://smfahim.xyz/gpt1image-ghibli?prompt=${encodedPrompt}&imageUrl=${encodedImg}`;
    } else {
      apiUrl = `https://smfahim.xyz/gpt1image-ghibli?prompt=${encodedPrompt}`;
    }

    // 로딩 리액션
    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      // API에서 JSON 배열 형태로 응답 받음: [ { "url": "https://..." } ]
      const res = await axios.get(apiUrl);
      const data = res.data;

      if (Array.isArray(data) && data[0] && data[0].url) {
        const imageUrl = data[0].url;
        const imageStream = await global.utils.getStreamFromURL(imageUrl);

        // "Generating please wait" 메시지를 일단 보내고, 이미지가 준비되면 바꾸기
        message.reply("✅ Generation complete. Sending image...", async (err, info) => {
          await message.reply({
            body: `🖼 Prompt: "${promptText}"`,
            attachment: imageStream
          });
          // 첫 번째 "Generating please wait" 메시지 삭제
          message.unsend(info.messageID);
        });

        // 성공 리액션
        api.setMessageReaction("✅", event.messageID, () => {}, true);
      } else {
        await message.reply("❌ Failed to get image URL from API.");
        api.setMessageReaction("❌", event.messageID, () => {}, true);
      }
    } catch (err) {
      console.error("o1 Command Error:", err.message);
      await message.reply("❌ An error occurred while generating the image.");
      api.setMessageReaction("❌", event.messageID, () => {}, true);
    }
  }
};
