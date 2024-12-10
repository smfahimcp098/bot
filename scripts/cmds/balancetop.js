module.exports = {
  config: {
    name: "balancetop",
    version: "1.0",
    author: "loufi",
    role: 0,
    shortDescription: {
      vi: "",
      en: "top 30 users 🥰"
    },
    longDescription: {
      vi: "",
      en: "😗"
    },
    category: "game",
    guide: {
      vi: "",
      en: ""
    }
  },
  onStart: async function ({ api, args, message, event, usersData }) {
    const allUsers = await usersData.getAll();

    const topUsers = allUsers.sort((a, b) => b.money - a.money).slice(0, 30);

    const topUsersList = topUsers.map((user, index) => `${index + 1}. ${user.name}: ${user.money}`);

    const messageText = `Top 30 richest members:\n${topUsersList.join('\n')}`;

    message.reply(messageText);
  }
};