require('dotenv').config();
const axios = require('axios');

async function getChatId() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || token === 'your_telegram_bot_token_here') {
    console.error('❌ Please add your TELEGRAM_BOT_TOKEN to the .env file first!');
    return;
  }

  console.log('Checking for recent messages to your bot...');
  try {
    const response = await axios.get(`https://api.telegram.org/bot${token}/getUpdates`);
    const data = response.data;

    if (!data.ok) {
      console.error('❌ Error from Telegram API:', data.description);
      return;
    }

    if (data.result.length === 0) {
      console.log('⚠️ No messages found. Please send a message (like "hello") to your bot on Telegram, then run this script again.');
      return;
    }

    // Get the most recent message
    const latestMessage = data.result[data.result.length - 1];
    const chatId = latestMessage.message.chat.id;
    const username = latestMessage.message.chat.username || latestMessage.message.chat.first_name;

    console.log(`✅ Success! Found a message from ${username}.`);
    console.log(`\nYour Chat ID is: ${chatId}\n`);
    console.log('Copy this number and put it in your .env file as TELEGRAM_CHAT_ID.');
  } catch (err) {
    console.error('❌ Failed to connect to Telegram API. Check your internet connection or token.', err.message);
  }
}

getChatId();
