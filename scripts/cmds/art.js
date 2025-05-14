const axios = require("axios");

module.exports = {
  config: {
    name: "art",
    role: 0,
    author: "S M Fahim",
    countDown: 5,
    longDescription: "Art image",
    category: "image",
    guide: {
      en: "${pn} reply to an image"
    }
  },

  onStart: async function ({ message, api, event }) {
    // Ensure user replied to an image
    if (!event.messageReply || !event.messageReply.attachments || !event.messageReply.attachments[0]) {
      return message.reply("⚠️ Please reply to an image.");
    }

    const originalUrl = event.messageReply.attachments[0].url;
    const encodedOriginal = encodeURIComponent(originalUrl);

    // React to indicate processing
    api.setMessageReaction("⏳", event.messageID, () => {}, true);
    const waitMsg = await message.reply("✅ Uploading image, please wait...");

    try {
      // Step 1: Upload original image to imgbb proxy
      const uploadRes = await axios.get(
        `https://www.smfahim.xyz/imgbb?url=${encodedOriginal}`
      );
      const uploadedUrl = uploadRes.data?.image?.url;
      if (!uploadedUrl) throw new Error("Upload failed");

      // Step 2: Request art generation JSON
      const artRes = await axios.get(
        `https://www.smfahim.xyz/art/glamai?url=${encodeURIComponent(uploadedUrl)}`
      );
      const data = artRes.data;
      if (data.status !== "READY" || !Array.isArray(data.media_urls) || !data.media_urls.length) {
        throw new Error("Invalid response from art API");
      }
      const mediaUrl = data.media_urls[0];

      // Step 3: Download generated image as stream
      const imageRes = await axios.get(mediaUrl, { responseType: 'stream' });
      const imageStream = imageRes.data;

      // Step 4: Send the image stream as attachment
      await api.sendMessage(
        { body: "🖼️ Here is your art.", attachment: imageStream },
        event.threadID,
        event.messageID
      );

      // React success
      api.setMessageReaction("✅", event.messageID, () => {}, true);

    } catch (err) {
      console.error(err);
      await message.reply("❌ Something went wrong. Please try again.");
      api.setMessageReaction("❌", event.messageID, () => {}, true);
    } finally {
      // Remove waiting message
      if (waitMsg && waitMsg.messageID) {
        await message.unsend(waitMsg.messageID);
      }
    }
  }
};



// const axios = require("axios");

// module.exports = {
//   config: {
//     name: "art",
//     role: 0,
//     author: "S M Fahim",
//     countDown: 5,
//     longDescription: "Art image",
//     category: "image",
//     guide: {
//       en: "${pn} reply to an image"
//     }
//   },

//   onStart: async function ({ message, api, event }) {
//     if (!event.messageReply || !event.messageReply.attachments || !event.messageReply.attachments[0]) {
//       return message.reply("⚠️ Please reply to an image.");
//     }

//     const originalUrl = event.messageReply.attachments[0].url;
//     const encodedOriginal = encodeURIComponent(originalUrl);

//     api.setMessageReaction("⏳", event.messageID, () => {}, true);
//     const waitMsg = await message.reply("✅ Uploading image, please wait...");

//     try {
//       const uploadRes = await axios.get(
//         `https://www.smfahim.xyz/imgbb?url=${encodedOriginal}`
//       );
//       const uploaded = uploadRes.data?.image?.url;
//       if (!uploaded) throw new Error("Upload failed");

//       const artUrl = `https://www.smfahim.xyz/art/glamai?url=${encodeURIComponent(uploaded)}`;
//       const artRes = await axios.get(artUrl, { responseType: 'stream' });
//       const imageStream = artRes.data;

//       await message.reply({
//         body: "🖼️ Here is your art.",
//         attachment: imageStream
//       });
//       api.setMessageReaction("✅", event.messageID, () => {}, true);

//     } catch (err) {
//       console.error(err);
//       await message.reply("❌ Something went wrong. Please try again.");
//       api.setMessageReaction("❌", event.messageID, () => {}, true);
//     } finally {
//       message.unsend(waitMsg.messageID);
//     }
//   }
// };
