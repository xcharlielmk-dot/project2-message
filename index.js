require('dotenv').config();
const { sendTelegramMessage } = require('./src/telegram');
const { getHKWeatherReport } = require('./src/weather');
const { getStockMarketUpdate } = require('./src/stocks');
const { getNotionNotesRevision } = require('./src/notion');

async function sendWeatherReport() {
  console.log('Fetching weather report...');
  const weather = await getHKWeatherReport();
  const fullReport = `<b>Good Morning, Charlie!</b> ☕\n\n${weather}`;
  await sendTelegramMessage(fullReport, 'weather');
}

async function sendStockUpdate() {
  console.log('Fetching stock update...');
  const stocks = await getStockMarketUpdate();
  const fullReport = `<b>Stock Market Update</b> 📈\n\n${stocks}`;
  await sendTelegramMessage(fullReport, 'stocks');
}

async function sendNotionNotes() {
  console.log('Fetching Notion notes...');
  const notes = await getNotionNotesRevision();
  const fullReport = `<b>Good Afternoon, Charlie!</b> 📚\n\nHere are some reminders for you:\n\n${notes}`;
  await sendTelegramMessage(fullReport, 'notion');
}

const arg = process.argv[2];
if (arg === 'weather') {
  sendWeatherReport();
} else if (arg === 'stocks') {
  sendStockUpdate();
} else if (arg === 'notion') {
  sendNotionNotes();
} else if (arg === 'test-bot') {
  sendTelegramMessage('<b>Bot Setup Successful!</b> 🎉\nYour Telegram connection is working.');
} else {
  console.log('Please provide a valid argument: weather, stocks, notion, or test-bot');
}
