require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

// Create the bot instance using the token from .env
const token = process.env.TELEGRAM_BOT_TOKEN;
let bot = null;

if (token && token !== 'your_telegram_bot_token_here') {
  bot = new TelegramBot(token, { polling: false });
}

/**
 * Sends a message to the configured Telegram chat.
 * @param {string} message - The message to send.
 */
async function sendTelegramMessage(message) {
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!bot || !chatId || chatId === 'your_telegram_chat_id_here') {
    console.error('Telegram bot token or chat ID is missing. Cannot send message:');
    console.log(message);
    return;
  }

  try {
    await bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
    console.log('Successfully sent message to Telegram.');
  } catch (error) {
    console.error('Error sending message to Telegram:', error.message);
  }
}

module.exports = {
  sendTelegramMessage
};
