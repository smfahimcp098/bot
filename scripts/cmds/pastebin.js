const PastebinAPI = require('pastebin-js');
const fs = require('fs').promises;
const path = require('path');

module.exports = {
 config: {
 name: "pastebin",
 aliases: ["paste"],
 version: "1.0",
 author: "SANDIP",
 countDown: 5,
 role: 2,
 shortDescription: {
 en: "Upload files or code snippets to pastebin and sends link"
 },
 longDescription: {
 en: "This command allows you to upload files or code snippets to pastebin and sends the link to the file."
 },
 category: "tools",
 guide: {
 en: "To use this command, type !pastebin <filename> to upload a file or reply to a message with the code you want to upload."
 }
 },

 onStart: async function({ api, event, args }) {
 const pastebin = new PastebinAPI({
 api_dev_key: 'LFhKGk5aRuRBII5zKZbbEpQjZzboWDp9',
 });

 if (event.type === "message_reply") {
 // Handling code from replied message
 const code = event.messageReply.body;
 try {
 const paste = await pastebin.createPaste({
 text: code,
 title: 'Replied Code',
 format: null,
 privacy: 1, // 1: Public, 2: Unlisted, 3: Private
 });

 const rawPaste = paste.replace("pastebin.com", "pastebin.com/raw");
 api.sendMessage(`Code uploaded to Pastebin: ${rawPaste}`, event.threadID);
 } catch (error) {
 console.error(error);
 api.sendMessage('An error occurred while uploading the code!', event.threadID);
 }
 } else {
 // Handling file upload
 const fileName = args[0];
 if (!fileName) {
 return api.sendMessage('Please provide a filename!', event.threadID);
 }

 const filePathWithoutExtension = path.join(__dirname, '..', 'cmds', fileName);
 const filePathWithExtension = path.join(__dirname, '..', 'cmds', fileName + '.js');

 let filePath;

 try {
 // Check if either file exists
 await fs.access(filePathWithoutExtension).catch(() => fs.access(filePathWithExtension));
 filePath = (await fs.access(filePathWithoutExtension).then(() => filePathWithoutExtension).catch(() => filePathWithExtension));
 } catch {
 return api.sendMessage('File not found!', event.threadID);
 }

 try {
 const data = await fs.readFile(filePath, 'utf8');

 const paste = await pastebin.createPaste({
 text: data,
 title: path.basename(filePath, path.extname(filePath)),
 format: null,
 privacy: 1, // 1: Public, 2: Unlisted, 3: Private
 });

 const rawPaste = paste.replace("pastebin.com", "pastebin.com/raw");
 api.sendMessage(`File uploaded to Pastebin: ${rawPaste}`, event.threadID);
 } catch (error) {
 console.error(error);
 api.sendMessage('An error occurred while uploading the file!', event.threadID);
 }
 }
 },
};