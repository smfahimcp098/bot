/* eslint-disable linebreak-style */
"use strict";

const axios = require('axios');
const FormData = require('form-data');
const { URL } = require('url');
const log = require('npmlog');

/**
 * Retrieves Facebook UID from a profile link using two methods:
 *  - Fast method via traodoisub API
 *  - Slow method via findids.net API
 */
async function findUid(link) {
  // Helper: fast lookup
  async function getUIDFast(url) {
    const form = new FormData();
    const parsed = new URL(url);
    form.append('link', parsed.href);
    try {
      const { data } = await axios.post('https://id.traodoisub.com/api.php', form, { headers: form.getHeaders() });
      if (data.error) throw new Error(data.error);
      return data.id || 'Not found';
    } catch (err) {
      log.error('findUid', 'Fast method failed: ' + err.message);
      throw err;
    }
  }
  // Helper: slow lookup
  async function getUIDSlow(url) {
    const form = new FormData();
    const parsed = new URL(url);
    form.append('username', parsed.pathname.replace(/\//g, ''));
    const userAgentList = [ /* ... array of UAs as before ... */ ];
    const ua = userAgentList[Math.floor(Math.random() * userAgentList.length)];
    try {
      const { data } = await axios.post(
        'https://api.findids.net/api/get-uid-from-username',
        form,
        { headers: { 'User-Agent': ua, ...form.getHeaders() } }
      );
      if (data.status !== 200) throw new Error(data.error || 'Unknown error');
      return data.data.id || 'Not found';
    } catch (err) {
      log.error('findUid', 'Slow method failed: ' + err.message);
      throw err;
    }
  }

  // Try fast then slow
  try {
    let uid = await getUIDFast(link);
    if (!isNaN(uid)) return uid;
  } catch (e) {
    // ignore, try slow
  }
  // fallback slow
  return await getUIDSlow(link);
}

const regExCheckURL = /^(http|https):\/\/[^ \"\']+$/;

module.exports = {
  config: {
    name: 'uid',
    version: '1.2',
    author: 'NTKhang & Fahim',
    countDown: 5,
    role: 0,
    shortDescription: {
      vi: 'Xem uid',
      en: 'View uid'
    },
    longDescription: {
      vi: 'Xem user id facebook của người dùng',
      en: 'View facebook user id of user'
    },
    category: 'info',
    guide: {
      vi: '{pn}: để xem uid của bạn\n{pn} @tag: xem uid của người được tag\n{pn} <link>: xem uid từ link profile',
      en: '{pn}: view your uid\n{pn} @tag: view uid of tagged user\n{pn} <link>: view uid from profile link'
    }
  },

  onStart: async function ({ message, event, args, getLang }) {
    try {
      // Reply to message: direct ID
      if (event.messageReply) {
        return message.reply(event.messageReply.senderID);
      }
      // No args: self
      if (!args[0]) {
        return message.reply(event.senderID);
      }
      // URLs
      if (args[0].match(regExCheckURL)) {
        let responses = '';
        for (const link of args) {
          try {
            const uid = await findUid(link);
            responses += `${link} => ${uid}\n`;
          } catch (err) {
            responses += `${link} (ERROR) => ${err.message}\n`;
          }
        }
        return message.reply(responses.trim());
      }
      // Mentions
      const { mentions } = event;
      let reply = Object.keys(mentions).join('\n');
      if (!reply) reply = getLang('syntaxError');
      return message.reply(reply);
    } catch (err) {
      log.error('uid', err);
      message.reply('Đã xảy ra lỗi: ' + err.message);
    }
  }
};
