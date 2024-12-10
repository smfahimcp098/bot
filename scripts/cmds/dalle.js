const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const KievRPSSecAuth = "FAByBBRaTOJILtFsMkpLVWSG6AN6C/svRwNmAAAEgAAACFFAAM7LvWgTMAQir65x8zB2qd+fN4tSA0Y3/QWCmJs4XR8S+Q9a+TSu9gyEbPq6cwfMN4XmpyxuzmL8VPBJotlTz3iepslV30LlAlFIE8Wey0uHLkQzXAX7ApkC9YaUPtK7Jeasej5TxuJ9LRVGf67RpI6CnperOmdWk3pC11xsP3e9DiCNZE3ktZfXvu2HL4SHTMi2LvKJvMCv5KvAOnuHTazJ/XKi9HpfP7nt7SHRpHqYqGIhxacIqmsaw+KHiM6Bsi8Kt6aJ3A+R8Y3Ay4DOvlZjn2GLIFUFIaQDAoeT/trOoYB2/niezsduq9RQEQjoJV7UH+mXxYPpH5B42QeGkSohrVxQFQ/YG6vvSJNIznA7f1qyzybz8SJ/mYGxZ3uwnuV6MvpWBfo9hgx3jLmY5ADqr2kJgYcjpLZoNOjBg+eClJI9vzw1jFZ2ceiyaZ7Lmvs+Q/z+FAkkPCwm3OFXDbi6k7B9uww0b7aYnThMPqfXInJomQ+luoc06vrX85NF3IcZzlqsELyewE35YPtPO9YNW82dJ6CeMsupOemxcYC9/Mg/xkQTbgkhe7JBtKJxXEPHySsY8vS0CGXvz2uADsFuKUE+ueSaWB7odwzD7hC4hMfvxrb2/Cz9iZUHVZzeEjrLY4jZirtST3X9T5U8y9SaoutTsNk5Dfl0Ws6PVw1DUof8AsJ9a39UyLWUa5s4OFzj/I4B/7adU61C9p75SIXttZW40lAxnrqyZVrr2ayCoAzue1DXVIJtM4Et/Pi01OiR99nFzKly1vIS3oJLLbk4dENienut/0G/N4WPNOty2DcwlLdoXnGWIlccUoL0zOcA4NsqPXeir/r4Cq0IIV9he9+XrgH05iJULKq9xBcEs8fabhxI7I19CB+H/HIxwh8ItK2CNikgRvU6YweI7C8UmQ7tCXNERWe/0DrxK7eDenZhg9aJL+oZiwhpd5ePjBWpSfz+BnTAHbWGA4+2CJiCpAtJ7dluUSC18prxSBtC6igsCUaobuFf1MQyj6+37JizSIlQ9+xnmHPSkTNYIQxDF73lr/nn6xeLmE2Ji0SEIGU5xeUnqcC5oGXari+bRFLQoJ7terZnDbZ2ER3agVhQEKFeLaUChbPOf+UHO9lOa+tCh6MizzAhK4HeTUVeVo4RCYdsweSC8B+LuSlN1TPsOLW5mHD5uRkexu7JpBrbiNU1lh8DHbqqXzgt2HjdDuGG39Mc9DH+jgWK007WRdozIYIL0y7bBwg9+f7JtcID/0AV3OSLFPdCkuBIEZ08h8Mz3PCRsNVZawF9kpzxyMhI5neyteOb77Frt6IHE/mVY0qfTk9JlyCTL5zl+UMQvC2tEugJngWJlGTFnKU6zv/yncVDr+nQB3xO62wv8U+3PLPN3kyRLvyKrA6GAkn8wU2eIc8buqRcSxHdd8KRKIUe6gKA9L3XFABBD0gnqc/jpO2z77ywWTkNq70b5A==";
const _U = "1WI5yCLqLPPZZYA2h61reCG8W2RNwylZQYZANq-_kAi2OQ8EAhznidd7e8_vwpky6IN8wIR69Xl3-d_1Ki2p_8hCDl_XC4z3wRyXm9FiImGQ-5cBq2NNYLr8L_EoAKrIjiomSrxDuOQs6Co2mLz1Dp1Rd7gQHqMIRLfLMk9yZwGJaYGgE8gMvidTAZQnDQzhB2wNvLf3_MckKcgKJyam9rA";

module.exports = {
  config: {
    name: "dalle",
    version: "1.0.2",
    author: "Samir Œ ",
    role: 2,
    countDown: 5,
    shortDescription: { en: "dalle3 image generator" },
    longDescription: { en: "dalle3 is a image generator powdered by OpenAi" },
    category: "image",
    guide: { en: "{prefix}dalle <search query>" }
  },

  onStart: async function ({ api, event, args }) {
    const prompt = args.join(" ");

    try {
      const res = await axios.get(`https://api-dalle-gen.onrender.com/dalle3?auth_cookie_U=${_U}&auth_cookie_KievRPSSecAuth=${KievRPSSecAuth}&prompt=${encodeURIComponent(prompt)}`);
      const data = res.data.results.images;

      if (!data || data.length === 0) {
        api.sendMessage("response received but imgurl are missing ", event.threadID, event.messageID);
        return;
      }

      const imgData = [];

      for (let i = 0; i < Math.min(4, data.length); i++) {
        const imgResponse = await axios.get(data[i].url, { responseType: 'arraybuffer' });
        const imgPath = path.join(__dirname, 'cache', `${i + 1}.jpg`);
        await fs.outputFile(imgPath, imgResponse.data);
        imgData.push(fs.createReadStream(imgPath));
      }

      await api.sendMessage({
        attachment: imgData,
        body: `Here's your generated image`
      }, event.threadID, event.messageID);

    } catch (error) {
      api.sendMessage("Can't Full Fill this request ", event.threadID, event.messageID);
    }
  }
};