let logs = [];

exports.addLog = (msg) => {
  const time = new Date().toISOString();
  logs.push(`[${time}] ${msg}`);

  if (logs.length > 300) logs.shift();
};

exports.getLogs = () => logs;

exports.clearLogs = () => {
  logs = [];
};