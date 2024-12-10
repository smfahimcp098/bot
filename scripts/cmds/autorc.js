module.exports = {
  config: {
    name: "autorc"
  },
  onStart: async () => {
    console.log("AutoRC command initialized successfully!");
  },
  onChat: async ({ event, api, message }) => {
    if (event.body && event.body === "❌ | Opps, You are not my Admin 🫠") {
      message.reaction('😠', event.messageID);
    }
  }
};