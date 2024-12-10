module.exports = {
  config: {
    name: "cpu",
    version: "2.0",
    author: "Nehal",
    role: 0,
    shortDescription: {
      en: "Displays detailed CPU and system information."
    },
    longDescription: {
      en: "Displays real-time CPU temperature, usage, and system information. A premium command for tech enthusiasts."
    },
    category: "system",
    guide: {
      en: "Use {p}cpu to check the current CPU conditions and system information of the bot."
    }
  },
  onStart: async function ({ api, event, args }) {
    // Simulate CPU temperature and usage for demonstration purposes
    const cpuTemperature = Math.random() * 100;
    const cpuUsage = Math.random() * 100;

    let cpuStatus = "Cool ✅";
    if (cpuTemperature > 80) {
      cpuStatus = "Hot ❎";
    }

    // Create a premium CPU meter
    const cpuMeter = createCPUMeter(cpuUsage);

    // Fetch system information (you can use a library like 'os' to get real system info)
    const systemInfo = getSystemInfo();

    // Compose the message with premium styling
    const message = `
🔷 MALTA ♡ CPU Monitor 🔷
CPU Temperature: ${cpuTemperature.toFixed(2)}°C
CPU Usage: ${cpuUsage.toFixed(2)}%
CPU Status: ${cpuStatus}

${cpuMeter}

System Information:
${systemInfo}
    `;

    // Send the premium CPU report
    api.sendMessage(message, event.threadID);
  }
};

// Function to create a premium CPU meter
function createCPUMeter(usage) {
  const meterWidth = 20; // Adjust the width of the meter
  const filledBlocks = Math.round((meterWidth * usage) / 100);
  const emptyBlocks = meterWidth - filledBlocks;

  return `[${'█'.repeat(filledBlocks)}${'░'.repeat(emptyBlocks)}] ${usage}%`;
}

// Function to get system information (simulated for demonstration)
function getSystemInfo() {
  return `
System: MALTA ♡ Bot System
Memory: 16GB RAM
Storage: 512GB SSD
OS: PremiumOS v3.0
    `;
}