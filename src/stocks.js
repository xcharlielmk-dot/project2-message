const YahooFinance = require('yahoo-finance2').default;
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

const INDICES = [
  { symbol: '^GSPC', name: 'S&P 500 (US)' },
  { symbol: '^N225', name: 'Nikkei 225 (Japan)' },
  { symbol: '000001.SS', name: 'SSE Composite (China)' },
  { symbol: '^HSI', name: 'Hang Seng (HK)' }
];

const STOCKS = [
  'AAPL', 'NVDA', 'GOOG', 'AMZN', 'BRK-B', 'TSLA', 'MSFT', '8058.T', '0700.HK'
];

/**
 * Helper to get the percentage change string with emoji
 * @param {number} changePercent 
 * @returns {string} Formatted string
 */
function formatChange(changePercent) {
  if (changePercent == null || isNaN(changePercent)) return 'N/A';
  const prefix = changePercent >= 0 ? '🟢 +' : '🔴 ';
  return `${prefix}${changePercent.toFixed(2)}%`;
}

/**
 * Helper to format date
 * @param {Date|string|number} date 
 * @returns {string} Formatted date string
 */
function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return ` [${d.toISOString().split('T')[0]}]`;
}

/**
 * Fetches the daily stock market update.
 * @returns {Promise<string>} A formatted stock market report.
 */
async function getStockMarketUpdate() {
  let report = '<b>📈 Daily Stock Market Update</b>\n\n';

  // 1. Fetch Indices
  report += '<b>Major Indices:</b>\n';
  for (const index of INDICES) {
    try {
      const quote = await yahooFinance.quote(index.symbol);
      const dateStr = formatDate(quote.regularMarketTime);
      report += `- ${index.name}: ${formatChange(quote.regularMarketChangePercent)}${dateStr}\n`;
    } catch (err) {
      report += `- ${index.name}: Failed to fetch\n`;
    }
  }

  // 2. Fetch Portfolio Stocks
  report += '\n<b>Your Portfolio:</b>\n';
  try {
    const quotes = await yahooFinance.quote(STOCKS);
    // ensure quotes is an array
    const quotesArray = Array.isArray(quotes) ? quotes : [quotes];
    
    for (const symbol of STOCKS) {
      const q = quotesArray.find(q => q.symbol === symbol);
      if (q) {
        // Handle names that might be missing
        const name = q.shortName || symbol;
        const dateStr = formatDate(q.regularMarketTime);
        report += `- ${symbol} (${name}): ${formatChange(q.regularMarketChangePercent)}${dateStr}\n`;
      } else {
        report += `- ${symbol}: Failed to fetch\n`;
      }
    }
  } catch (err) {
    console.error('Error fetching stock data:', err.message);
    report += 'Error fetching portfolio data.\n';
  }

  return report;
}

module.exports = {
  getStockMarketUpdate
};
