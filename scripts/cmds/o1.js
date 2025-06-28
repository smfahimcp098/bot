const axios = require("axios");

module.exports = { config: { name: "o1", version: "1.7", author: "S M Fahim", countDown: 10, role: 0, longDescription: { en: "Generate Ghibli-style images. Supports reply-image, --count/--n, --ar, --custom <url>, --fahim, and --tawsif." }, category: "image", guide: { en: `{pn} <prompt> [--count N | --n N] [--ar ratio] [--custom <image_url>] [--fahim] [--tawsif]

Examples: • {pn} sunset --count 3 --ar 2:3 • {pn} a cute girl --ar 3:2 • {pn} landscape --custom https://example.com/image.jpg • {pn} add ghibli style of this image --fahim • {pn} add another style of this image --tawsif` } },

onStart: async function ({ message, api, args, event }) { if (!args.length) return message.reply("⚠️ Please provide a prompt.");

let count = 1;
let ratio = "1:1";
let customImageUrl = null;
let useFahimImage = false;
let useTawsifImage = false;
const promptParts = [];

const fahimDefaultUrl = "https://i.postimg.cc/Bn6NbyD3/1709560207712-3.jpg";
const tawsifDefaultUrl = "https://i.ibb.co/3m1QCsd9/197b5ef4eee.jpg";

// Parse args
for (let i = 0; i < args.length; i++) {
  const arg = args[i].toLowerCase();
  switch (arg) {
    case "--count":
    case "--n":
      if (args[i + 1]) {
        const num = parseInt(args[++i]);
        if (num >= 1 && num <= 4) count = num;
        else return message.reply("⚠️ --count/--n must be between 1 and 4.");
      }
      break;
    case "--ar":
      if (args[i + 1]) {
        const r = args[++i];
        if (["1:1", "2:3", "3:2"].includes(r)) ratio = r;
        else return message.reply("⚠️ --ar must be one of: 1:1, 2:3, 3:2.");
      }
      break;
    case "--custom":
    case "--cref":
      if (!args[i + 1] || args[i + 1].startsWith("--")) {
        return message.reply("⚠️ Please provide a valid image URL after `--custom`/`--cref`.");
      }
      customImageUrl = args[++i];
      break;
    case "--fahim":
      useFahimImage = true;
      break;
    case "--tawsif":
      useTawsifImage = true;
      break;
    default:
      promptParts.push(args[i]);
  }
}

const promptText = promptParts.join(" ").trim();
if (!promptText) return message.reply("⚠️ Please provide a valid prompt.");

// Map ratio to size
const ratioToSize = {
  "1:1": "1024x1024",
  "2:3": "1024x1536",
  "3:2": "1536x1024"
};
const size = ratioToSize[ratio] || "1024x1024";

// Build base URL
let url = `https://smfahim.xyz/gpt1image-ghibli?prompt=${encodeURIComponent(promptText)}&size=${encodeURIComponent(size)}&n=${count}`;

// Collect image sources in priority: custom > fahim > tawsif > reply-images
let imageUrls = [];
if (customImageUrl) {
  imageUrls = [customImageUrl];
} else if (useFahimImage) {
  imageUrls = [fahimDefaultUrl];
} else if (useTawsifImage) {
  imageUrls = [tawsifDefaultUrl];
}
// Always include up to 4 reply images if none of the above flags or alongside flags
const replyUrls = event.messageReply?.attachments
  ?.filter(a => a.type === "photo")
  .map(a => a.url) || [];
imageUrls.push(...replyUrls);

if (imageUrls.length) {
  // limit to 4 and encode each
  const encoded = imageUrls.slice(0, 4).map(u => encodeURIComponent(u));
  url += `&imageUrl=${encoded.join(",")}`;
}

api.setMessageReaction("⏳", event.messageID, () => {}, true);
try {
  const res = await axios.get(url);
  const images = res.data?.data;
  if (!Array.isArray(images) || images.length === 0) {
    await message.reply("❌ No image returned from the API.");
    api.setMessageReaction("❌", event.messageID, () => {}, true);
    return;
  }
  const attachments = await Promise.all(
    images.map(img => global.utils.getStreamFromURL(img.url))
  );
  await message.reply({
    body: `🖼 Prompt: "${promptText}" (${images.length} image${images.length > 1 ? "s" : ""})`,
    attachment: attachments
  });
  api.setMessageReaction("✅", event.messageID, () => {}, true);
} catch (err) {
  console.error("o1 error:", err?.response?.data || err.message);
  await message.reply("❌ Failed to generate image. Try again later.");
  api.setMessageReaction("❌", event.messageID, () => {}, true);
}

} };

