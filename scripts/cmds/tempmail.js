const x = "xyz";
const axios = require("axios");

module.exports = {
  config: {
    name: "tempmail",
    version: "1.1",
    author: "Fahim_Noob",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "generate temporary emails and retrieve inbox messages",
      vi: "generate temporary emails and retrieve inbox messages",
    },
    longDescription: {
      en: "generate temporary emails and retrieve inbox messages",
      vi: "generate temporary emails and retrieve inbox messages",
    },
    category: "owner",
    guide: {
      en: "{pn} gen\n{pn} inbox (email)",
      vi: "{pn} gen\n{pn} inbox (email)",
    },
  },

  onStart: async function ({ api, args, event }) {
    const command = args[0];

    try {
      if (command === "gen") {
        // Fetch the temporary email
        const tempMailResponse = await axios.get('https://smfahim.${x}/tempmail');
        const email = tempMailResponse.data.email; // Adjust based on the actual response structure

        // Send the generated email back to the user
        api.sendMessage(`${email}`, event.threadID, event.messageID);

      } else if (command === "inbox") {
        const email = args[1];

        if (!email) {
          return api.sendMessage("Please provide a valid email address.", event.threadID, event.messageID);
        }

        // Fetch the messages for the temporary email
        const messageResponse = await axios.get(`https://www.smfahim.${x}/tempmail/inbox?email=${email}`);
        const messages = messageResponse.data.messages; // Adjust based on the actual response structure

        if (messages.length === 0) {
          return api.sendMessage("No messages found for this email.", event.threadID, event.messageID);
        }

        const formattedMessages = messages.map((msg) => {
          return `From: ${msg.sender}\nSubject: ${msg.subject}\nMessage: ${msg.message}`;
        }).join("\n\n");

        // Send the inbox messages back to the user
        api.sendMessage(`Inbox Messages:\n\n${formattedMessages}`, event.threadID, event.messageID);

      } else {
        api.sendMessage("Invalid command. Please use 'gen' to generate email or 'inbox' to retrieve messages.", event.threadID, event.messageID);
      }
    } catch (error) {
      console.error("Error:", error);
      api.sendMessage("An error occurred while processing your request.", event.threadID, event.messageID);
    }
  }
};