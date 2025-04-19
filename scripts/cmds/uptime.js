const os = require('os');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

module.exports = {
  config: {
    name: 'uptime',
    aliases: ["up","upt"],
    role: 0,
    author: 'fahim',
    category: 'utility',
    version: '1',
    shortDescription: 'Show the bot running time.',
    longDescription: 'Show the bot running time and see the host server information.',
    guide: {
      en: 'Usage: {p}up'
    }
  },
  onStart: async function ({ api, args, message, event, threadsData, usersData }) {
    const users = await usersData.getAll();
    const groups = await threadsData.getAll();
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const mins = Math.floor((uptime % 3600) / 60);
    const secs = Math.floor(uptime % 60);
    const time = `${hours} hours, ${mins} minutes, ${secs} seconds.`;

    const totalMem = os.totalmem() / 1024 / 1024 / 1024; // Convert MB to GB
    const freeMem = os.freemem() / 1024 / 1024 / 1024;   // Convert MB to GB
    const usedMem = totalMem - freeMem;
    const memUsagePercent = (usedMem / totalMem) * 100;

    const diskUsage = await getDiskUsage();

    const cpuUsage = os.loadavg();

    const fahim = {
      os: `${os.type()} ${os.release()}`,
      arch: os.arch(),
      cpu: `${os.cpus()[0].model} (${os.cpus().length} cores)`,
    };
    const networkInterfaces = os.networkInterfaces();
    const networkInfo = Object.keys(networkInterfaces).map(interface => {
      return {
        interface,
        addresses: networkInterfaces[interface].map(info => `${info.family}: ${info.address}`)
      };
    });

    const msg = `⏰ Bot Uptime: ${time}
🖥️ Host Server: ${fahim.os}
💾 Host Architecture: ${fahim.arch}
🖥️ Host CPU: ${fahim.cpu}
⌨️ CPU Usage: ${cpuUsage.join(', ')}
📀 Total Ram: ${totalMem.toFixed(2)} GB
💽 Ram Usage: ${usedMem.toFixed(2)} GB (${memUsagePercent.toFixed(2)}%)
💽 Free Ram: ${freeMem.toFixed(2)} GB

👤 Total Users: ${users.length}
👥 Total Groups: ${groups.length}
🌐 Network Interfaces: ${networkInfo.map(info => info.interface).join(', ')}
📎 Network Addresses: ${networkInfo.map(info => info.addresses.join(', ')).join('\n')}`;

    // Send reply using message.reply
    message.reply(msg);
  }
};

async function getDiskUsage() {
  const { stdout } = await exec('df -k /');
  const [_, total, used] = stdout.split('\n')[1].split(/\s+/).filter(Boolean);
  return { total: parseInt(total) * 1024, used: parseInt(used) * 1024 };
}

async function formatBytes(bytes) {
  const Fahim = ['B', 'KB', 'MB', 'GB', 'TB'];
  let idx = 0;
  while (bytes >= 1024 && idx < Fahim.length - 1) {
    bytes /= 1024;
    idx++;
  }
  return `${bytes.toFixed(2)} ${Fahim[idx]}`;
}
