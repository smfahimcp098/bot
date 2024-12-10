const dep = {
  axios: require('axios'),
  fs: require('fs'),
  path: require('path')
};

module.exports = {
  config: {
    name: "country",
    aliases: [],
    version: "1.0",
    author: "Team Calyx",
    role: 0,
    shortDescription: {
      en: "Fetch information about a country"
    },
    longDescription: {
      en: "Fetches detailed information about a specified country from a given URL."
    },
    category: "utility",
    guide: {
      en: "Type {pn} countryinfo <country_name> to get information about that country."
    }
  },
  onStart: async function ({ api, event, args }) {
    const countryName = args.join(" ");
    if (!countryName) {
      return api.sendMessage("Please specify a country name.", event.threadID, event.messageID);
    }

    async function getCountryInfo(countryName) {
      try {
        const ok = "xyz";
        const response = await dep.axios.get(`https://smfahim.${ok}/country/${encodeURIComponent(countryName)}`);
        const countryData = response.data[0];

        const countryInfo = {
          name: countryData.name.common,
          capital: countryData.capital ? countryData.capital[0] : 'N/A',
          region: countryData.region,
          subregion: countryData.subregion,
          languages: countryData.languages ? Object.values(countryData.languages).join(', ') : 'N/A',
          population: countryData.population,
          currency: countryData.currencies ? countryData.currencies[Object.keys(countryData.currencies)[0]].name : 'N/A',
          currencySymbol: countryData.currencies ? countryData.currencies[Object.keys(countryData.currencies)[0]].symbol : 'N/A',
          timezones: countryData.timezones.join(', '),
          flag: countryData.flags ? countryData.flags[0] : '',
          area: countryData.area
        };

        return countryInfo;
      } catch (error) {
        console.error("Error fetching country data:", error);
        throw new Error('Could not fetch country data.');
      }
    }

    async function downloadImage(url, filepath) {
      try {
        const response = await dep.axios({
          url,
          responseType: 'stream'
        });
        return new Promise((resolve, reject) => {
          const stream = response.data.pipe(dep.fs.createWriteStream(filepath));
          stream.on('finish', () => resolve(filepath));
          stream.on('error', (e) => reject(e));
        });
      } catch (error) {
        console.error("Error downloading image:", error);
        throw new Error('Could not download image.');
      }
    }

    try {
      const countryInfo = await getCountryInfo(countryName);

      const countryInfoMessage = `Country Name: ${countryInfo.name} \nCapital: ${countryInfo.capital} \nRegion: ${countryInfo.region} \nSubregion: ${countryInfo.subregion} \nLanguages: ${countryInfo.languages} \nPopulation: ${countryInfo.population} \nCurrency: ${countryInfo.currency} (${countryInfo.currencySymbol}) \nTimezones: ${countryInfo.timezones} \nArea: ${countryInfo.area} sq km`;

      if (countryInfo.flag) {
        const filepath = dep.path.join(__dirname, 'flag.png');
        await downloadImage(countryInfo.flag, filepath);

        const message = {
          body: countryInfoMessage,
          attachment: dep.fs.createReadStream(filepath)
        };

        api.sendMessage(message, event.threadID, () => {
          dep.fs.unlinkSync(filepath); // Clean up the temporary file
        }, event.messageID);
      } else {
        api.sendMessage(countryInfoMessage, event.threadID, event.messageID);
      }
    } catch (error) {
      api.sendMessage("Sorry, I could not fetch the country data at this moment.", event.threadID, event.messageID);
    }
  }
};
