const axios = require('axios');

module.exports = {
    config: {
        name: "pf",
        version: "1.1",
        author: "Team Calyx",
        description: "Ask AI a question",
        role: 0,
        category: "𝗔𝗜",
        guide: {
            en: "{p}{n} <question> to ask AI a question.",
        },
    },
    onStart: async function ({ message, event, args }) {
        if (args.length === 0) {
            message.reply("Please provide a question to ask the AI.");
            return;
        }
        await sendMessage(message, args.join(" "), event, this.config);
    },
};

const sendMessage = async (message, question, event, config) => {
    try {
        const encodedQuestion = encodeURIComponent(question);
        const response = await axios.get(`http://45.90.12.34:5047/promptflux?q=${encodedQuestion}`);

        if (response.status !== 200) throw new Error('API error');

        const aiResponse = response.data.data;

        message.reply({
            body: `${aiResponse}`,
        }, (err, info) => {
            if (err) return console.error(err);
        });
    } catch (error) {
        console.error("Error:", error.message);
        message.reply("Sorry, there was an error processing your request.");
    }
};