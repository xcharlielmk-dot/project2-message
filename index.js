require('dotenv').config();
const cron = require('node-cron');
const { sendTelegramMessage } = require('./src/telegram');
const { getHKWeatherReport } = require('./src/weather');
const { getStockMarketUpdate } = require('./src/stocks');
const { getNewsUpdate } = require('./src/news');
const { getNotionNotesRevision } = require('./src/notion');

/**
 * Executes the morning digest: Weather, Stocks, and News.
 */
async function sendMorningDigest() {
  console.log('Fetching morning digest...');
  const weather = await getHKWeatherReport();
  const stocks = await getStockMarketUpdate();
  const news = await getNewsUpdate();

  const fullReport = `<b>Good Morning, Charlie!</b> ☕\n\n${weather}\n\n---\n\n${stocks}\n\n---\n\n${news}`;
  
  await sendTelegramMessage(fullReport);
}

/**
 * Executes the afternoon digest: Notion Notes.
 */
async function sendAfternoonDigest() {
  console.log('Fetching afternoon digest...');
  const notes = await getNotionNotesRevision();

  const fullReport = `<b>Good Afternoon, Charlie!</b> 📚\n\nHere are some reminders for you:\n\n${notes}`;
  
  await sendTelegramMessage(fullReport);
}

// ------------------------------------------------------------
// Schedule the tasks
// ------------------------------------------------------------

// Schedule morning digest for 8:00 AM every day
cron.schedule('0 8 * * *', () => {
  console.log('Running scheduled morning digest...');
  sendMorningDigest();
}, {
  scheduled: true,
  timezone: 'Asia/Hong_Kong'
});

// Schedule afternoon digest for 3:00 PM every day
cron.schedule('0 15 * * *', () => {
  console.log('Running scheduled afternoon digest...');
  sendAfternoonDigest();
}, {
  scheduled: true,
  timezone: 'Asia/Hong_Kong'
});

console.log('Automation bot is running. Cron jobs are scheduled.');
console.log('Press Ctrl+C to exit.');

// ------------------------------------------------------------
// Optional: Command Line Interface for testing
// Run `node index.js test-morning` or `node index.js test-afternoon`
// ------------------------------------------------------------
const arg = process.argv[2];
if (arg === 'test-morning') {
  sendMorningDigest();
} else if (arg === 'test-afternoon') {
  sendAfternoonDigest();
} else if (arg === 'test-bot') {
  sendTelegramMessage('<b>Bot Setup Successful!</b> 🎉\nYour Telegram connection is working.');
}
