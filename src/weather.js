const axios = require('axios');

/**
 * Fetches the current weather data from the Hong Kong Observatory API.
 * @returns {Promise<string>} A formatted weather report.
 */
async function getHKWeatherReport() {
  try {
    const response = await axios.get('https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=rhrread&lang=en');
    const data = response.data;

    let report = '<b>🌤️ HK Weather Update</b>\n\n';

    // Temperature & Humidity
    if (data.temperature && data.temperature.data && data.temperature.data.length > 0) {
      const hkObservatoryTemp = data.temperature.data.find(t => t.place === 'Hong Kong Observatory');
      const temp = hkObservatoryTemp ? hkObservatoryTemp.value : data.temperature.data[0].value;
      report += `🌡️ <b>Temperature:</b> ${temp}°C\n`;
    }

    if (data.humidity && data.humidity.data && data.humidity.data.length > 0) {
      report += `💧 <b>Humidity:</b> ${data.humidity.data[0].value}%\n`;
    }

    // UV Index
    if (data.uvindex && data.uvindex.data && data.uvindex.data.length > 0) {
      report += `☀️ <b>UV Index:</b> ${data.uvindex.data[0].value} (${data.uvindex.data[0].desc})\n`;
    }

    // Warnings (Typhoon, Rainstorm, etc.)
    if (data.warningMessage && data.warningMessage.length > 0) {
      report += `\n⚠️ <b>Active Warnings:</b>\n`;
      data.warningMessage.forEach(warning => {
        report += `- ${warning}\n`;
      });
    } else {
      report += `\n✅ <b>Warnings:</b> No active weather warnings.\n`;
    }

    // Rainfall
    if (data.rainfall && data.rainfall.data && data.rainfall.data.length > 0) {
      const generalRainfall = data.rainfall.data[0];
      report += `\n🌧️ <b>Rainfall:</b> ${generalRainfall.max}mm (Max)\n`;
    }

    return report;
  } catch (error) {
    console.error('Error fetching weather data:', error.message);
    return '<b>🌤️ HK Weather Update</b>\n\nError fetching weather data.';
  }
}

module.exports = {
  getHKWeatherReport
};
