const axios = require("axios");
const cheerio = require("cheerio");

module.exports = {
  config: {
    name: "covid",
    aliases: [],
    version: "1.0",
    author: "S M Fahim",
    countDown: 5,
    role: 0,
    longDescription: { en: "বাংলাদেশের COVID-19 ড্যাশবোর্ড থেকে আপডেট পাওয়া যাবে।" },
    category: "info",
  },
  onStart: async function({ message }) {
    try {
      const res = await axios.get('https://dashboard.dghs.gov.bd/pages/covid19.php', { timeout: 15000 });
      const $ = cheerio.load(res.data);

      const toBanglaNumber = (num) => {
        const bnDigits = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
        return num.toString().replace(/\d/g, d => bnDigits[+d]);
      };

      const monthMap = {
        January: 'জানুয়ারী', February: 'ফেব্রুয়ারী', March: 'মার্চ', April: 'এপ্রিল', May: 'মে', June: 'জুন',
        July: 'জুলাই', August: 'আগস্ট', September: 'সেপ্টেম্বর', October: 'অক্টোবর',
        November: 'নভেম্বর', December: 'ডিসেম্বর'
      };
      const toBanglaDate = (engDate) => {
        const parts = engDate.match(/(\w+)\s+(\d{1,2}),\s*(\d{4})/);
        if (!parts) return engDate;
        const [, monthEng, day, year] = parts;
        const monthBn = monthMap[monthEng] || monthEng;
        return `${monthBn} ${toBanglaNumber(day)}, ${toBanglaNumber(year)}`;
      };

      const lastUpdatedEng = $('p.last-updated').first().text().replace(/Last updated:\s*/i, '').trim();
      const lastUpdatedBn = toBanglaDate(lastUpdatedEng);

      const stats = {};
      $('div.stat-card').each((i, el) => {
        const label = $(el).find('h3').text().toLowerCase();
        const value = $(el).find('.value').text().replace(/,/g, '').trim();
        if (label.includes('lab test')) stats['🧪 ল্যাব টেস্ট'] = toBanglaNumber(value);
        else if (label.includes('confirmed')) stats['✅ নিশ্চিত'] = toBanglaNumber(value);
        else if (label.includes('recovered')) stats['😊 সেরে উঠেছে'] = toBanglaNumber(value);
      });

      const yearStats = {};
      $('h4.column-header').filter((i, el) => $(el).text().includes('This Year')).closest('.stats-column').find('.mini-stat').each((i, el) => {
        const title = $(el).find('.mini-stat-title').text().toLowerCase();
        const val = $(el).find('.mini-stat-value').text().replace(/,/g, '').trim();
        if (title === 'tests') yearStats['🧪 টেস্ট'] = toBanglaNumber(val);
        else if (title === 'confirmed') yearStats['✅ নিশ্চিত'] = toBanglaNumber(val);
        else if (title === 'recovered') yearStats['😊 সেরে উঠেছে'] = toBanglaNumber(val);
        else if (title === 'deaths') yearStats['☠️ মৃত্যু'] = toBanglaNumber(val);
      });

      const last24hStats = {};
      $('h4.column-header').filter((i, el) => $(el).text().includes('Last 24 hours')).closest('.stats-column').find('.mini-stat').each((i, el) => {
        const title = $(el).find('.mini-stat-title').text().toLowerCase();
        const val = $(el).find('.mini-stat-value').text().replace(/,/g, '').trim();
        if (title === 'tests') last24hStats['🧪 টেস্ট'] = toBanglaNumber(val);
        else if (title === 'confirmed') last24hStats['✅ নিশ্চিত'] = toBanglaNumber(val);
        else if (title === 'recovered') last24hStats['😊 সেরে উঠেছে'] = toBanglaNumber(val);
        else if (title === 'deaths') last24hStats['☠️ মৃত্যু'] = toBanglaNumber(val);
      });

      const formatStats = (obj) =>
        Object.entries(obj).map(([k, v]) => `• ${k}: ${v}`).join('\n');

      const replyMsg = `🦠 *বাংলাদেশ COVID-19 আপডেট* 🦠\n━━━━━━━━━━━━━━━\n🕒 শেষ আপডেট: ${lastUpdatedBn}\n\n📊 *মোট তথ্য:*
${formatStats(stats)}\n\n📅 *২০২৫ সালের তথ্য:*
${formatStats(yearStats)}\n\n🕐 *গত ২৪ ঘণ্টার তথ্য:*
${formatStats(last24hStats)}\n━━━━━━━━━━━━━━━\nসবার সুস্থতা কামনায় 🙏 🥀`.trim();

      await message.reply(replyMsg);

    } catch (error) {
      console.error(error);
      await message.reply("❌ | ডেটা আনার সময় সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।");
    }
  }
};
