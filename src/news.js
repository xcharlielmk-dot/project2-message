const axios = require('axios');

/**
 * Fetches the daily news update related to the invested companies.
 * @returns {Promise<string>} A formatted news report.
 */
async function getNewsUpdate() {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey || apiKey === 'your_newsapi_org_key_here') {
    return '<b>📰 Daily News Update</b>\n\nNewsAPI key is not configured. Please add NEWS_API_KEY to your .env file.';
  }

  // Define keywords based on the portfolio
  const query = '"Apple" OR "Nvidia" OR "Google" OR "Amazon" OR "Tesla" OR "Microsoft" OR "Tencent" OR "Mitsubishi" OR "Berkshire"';

  try {
    // Fetch top business headlines or search everything for the past 24 hours
    // Using everything endpoint to get specific company news
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0]; // YYYY-MM-DD

    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: query,
        language: 'en',
        sortBy: 'relevancy',
        from: dateStr,
        pageSize: 2, // We only need 2 news articles
        apiKey: apiKey
      }
    });

    const articles = response.data.articles;

    let report = '<b>📰 Daily News Update</b>\n\n';

    if (articles && articles.length > 0) {
      articles.forEach((article, index) => {
        const source = article.source && article.source.name ? article.source.name : 'Unknown Source';
        report += `${index + 1}. <b>${article.title}</b> (${source})\n`;
        report += `${article.url}\n\n`;
      });
    } else {
      report += 'No relevant news found today for your portfolio companies.\n';
    }

    return report.trim();
  } catch (error) {
    console.error('Error fetching news:', error.message);
    return '<b>📰 Daily News Update</b>\n\nError fetching news from NewsAPI.';
  }
}

module.exports = {
  getNewsUpdate
};
