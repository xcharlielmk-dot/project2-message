require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

/**
 * Sends a message to the configured Telegram chat(s).
 * @param {string} message - The message to send.
 * @param {string} [taskName] - The task name (e.g., 'weather', 'stocks', 'notion')
 */
async function sendTelegramMessage(message, taskName) {
  const tokenEnv = process.env.TELEGRAM_BOT_TOKEN;
  const chatIdEnv = process.env.TELEGRAM_CHAT_ID;

  if (!tokenEnv || tokenEnv === 'your_telegram_bot_token_here' || !chatIdEnv || chatIdEnv === 'your_telegram_chat_id_here') {
    console.error('Telegram bot token or chat ID is missing. Cannot send message:');
    console.log(message);
    return;
  }

  // Split by comma and trim any whitespace
  const tokens = tokenEnv.split(',').map(t => t.trim()).filter(t => t);
  const chatIds = chatIdEnv.split(',').map(id => id.trim()).filter(id => id);

  try {
    const promises = [];
    
    // If there's only one token but multiple chat IDs, use the same bot for all
    if (tokens.length === 1) {
      const bot = new TelegramBot(tokens[0], { polling: false });
      for (let i = 0; i < chatIds.length; i++) {
        const chatId = chatIds[i];
        
        // The first set (index 0) receives all. The second set (index > 0) receives only task1 and task2.
        if (taskName === 'notion' && i > 0) {
          continue;
        }

        promises.push(
          bot.sendMessage(chatId, message, { parse_mode: 'HTML' })
            .then(() => console.log(`Successfully sent message to Telegram chat ${chatId}.`))
            .catch(error => console.error(`Error sending message to Telegram chat ${chatId}:`, error.message))
        );
      }
    } else {
      // If there are multiple tokens, match them to chat IDs by index
      for (let i = 0; i < chatIds.length; i++) {
        const chatId = chatIds[i];
        
        // The first set (index 0) receives all. The second set (index > 0) receives only task1 and task2.
        if (taskName === 'notion' && i > 0) {
          continue;
        }

        // Use matching token by index, or fallback to the first token if not enough tokens are provided
        const token = tokens[i] || tokens[0];
        const bot = new TelegramBot(token, { polling: false });
        
        promises.push(
          bot.sendMessage(chatId, message, { parse_mode: 'HTML' })
            .then(() => console.log(`Successfully sent message to Telegram chat ${chatId}.`))
            .catch(error => console.error(`Error sending message to Telegram chat ${chatId}:`, error.message))
        );
      }
    }

    await Promise.all(promises);
  } catch (error) {
    console.error('Unexpected error while sending messages:', error.message);
  }
}

module.exports = {
  sendTelegramMessage
};
