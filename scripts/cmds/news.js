const axios = require("axios");

module.exports = {
  config: {
    name: "news",
    version: "1.0",
    author: "JARiF",
    countDown: 10,
    role: 1,
    category: "utilities",
    guide: {
      vi: "{pn}",
      en: "{pn}"
    }
  },

  onStart: async function ({ message, event }) {
    let news;
    try {
      const res = await axios.get("https://apis.vyturex.com/bbcnews");
      news = res.data;
      if (!Array.isArray(news) || news.length === 0)
        return message.reply("😔 দুঃখিত, কোনো খবর পাওয়া যায়নি। পরে আবার চেষ্টা করুন।");
    } catch (err) {
      console.error("BBC API error:", err);
      return message.reply("❌ খবর আনতে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।");
    }

    let replyText = "📰 *BBC বাংলা শিরোনাম (১-৫)*:\n\n";
    for (let i = 0; i < Math.min(news.length, 5); i++) {
      replyText += `*${i + 1}. ${news[i].title}*\n`;
    }
    replyText += "\n📥 বিস্তারিত জানতে ১-৫ এর মধ্যে একটি নাম্বার রিপ্লাই করুন।";

    const sentMsg = await message.reply(replyText.trim());

    global.GoatBot.onReply.set(sentMsg.messageID, {
      commandName: this.config.name,
      author: event.senderID,
      newsList: news.slice(0, 5),
      pagedReplies: {} 
    });
  },

  onReply: async function ({ Reply, message, event }) {
    const { newsList, pagedReplies } = Reply;
    const userID = event.senderID;
    const body = event.body?.trim().toLowerCase();

    if (body === "next") {
      const session = pagedReplies[userID];
      if (!session) return message.reply("⚠ আগে কোনো খবর খোলা হয়নি।");
      if (session.index + 1 >= session.chunks.length) return message.reply("✅ আর কিছু নেই দেখানোর মতো।");

      session.index++;
      return message.reply(session.chunks[session.index]);
    }

    // Handle number selection
    const choice = parseInt(body);
    if (isNaN(choice) || choice < 1 || choice > newsList.length)
      return message.reply("❌ অনুগ্রহ করে ১ থেকে ৫ এর মধ্যে একটি সঠিক সংখ্যা দিন।");

    const selected = newsList[choice - 1];
    const idMatch = selected.link.match(/\/articles\/([^\/?#]+)/);
    const articleId = idMatch ? idMatch[1] : null;

    try {
      const res = await axios.get(`https://apis.vyturex.com/bbcpost?id=${articleId}`);
      const data = res.data;

      const fullText = `📰 *${data.captions}*\n\n🕒 প্রকাশিত: ${data.time}\n\n🔗 https://www.bbc.com/bengali/articles/${articleId}\n\n📝 ${data.paragraphs || "সংক্ষিপ্তসার পাওয়া যায়নি।"}`;
      const chunks = splitText(fullText, 1800);

      const replyBody = `${chunks[0]}\n\n✏ পরবর্তী অংশ দেখতে 'next' লিখুন।`;
const sent = await message.reply(replyBody);

pagedReplies[userID] = {
  chunks,
  index: 0
};

global.GoatBot.onReply.set(sent.messageID, {
  commandName: this.config.name,
      author: event.senderID,
  pagedReplies
});

    } catch (err) {
      console.error("BBC POST fetch error:", err);
      return message.reply("❌ বিস্তারিত খবর আনতে সমস্যা হয়েছে।");
    }
  }
};

function splitText(text, maxLength) {
  const chunks = [];
  while (text.length > maxLength) {
    let splitAt = text.lastIndexOf("\n", maxLength);
    if (splitAt === -1) splitAt = maxLength;
    chunks.push(text.slice(0, splitAt));
    text = text.slice(splitAt).trim();
  }
  if (text.length > 0) chunks.push(text);
  return chunks;
}
