const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "d",
    author: "OtinXSandip",
    version: "1.0",
    role: 2,
    description: "Delete orders",
    usage: "delete <file name>",
    category: "admin",
  },

  onStart: async function ({ args, message }) {
    const commandName = args[0];

    if (!commandName) {
      return message.reply("Use ${pn}d <file name>.js");
    }

    const filePath = path.join(__dirname, '..', 'cmds', `${commandName}`);

    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        message.reply(`✅ | ( ${commandName} ) command file has been deleted.`);
      } else {
        message.reply(`⏳ | I can't find this command name : ( ${commandName} )`);
      }
    } catch (err) {
      console.error(err);
      message.reply(`❌ | ( ${commandName} ) this command cannot be deleted because:  ${err.message}`);
    }
  }
};