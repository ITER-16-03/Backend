// import axios from "axios";

// const api = axios.create({
//   baseURL: process.env.WEATHER_API_URL || "https://api.open-meteo.com/v1",
//   timeout: 6000,
// });

// export const getWeatherForAlerts = async (lat, lon) => {
//   try {
//     const response = await api.get("/forecast", {
//       params: {
//         latitude: lat,
//         longitude: lon,
//         hourly: "temperature_2m,precipitation",
//         daily: "temperature_2m_max,temperature_2m_min,precipitation_sum",
//         timezone: "auto",
//       },
//     });

//     if (!response.data?.hourly || !response.data?.daily) {
//       throw new Error("Invalid weather API response");
//     }

//     const hourly = response.data.hourly;
//     const daily = response.data.daily;

//     const temps = hourly.temperature_2m || [];
//     const rains = hourly.precipitation || [];

//     const currentHour = new Date().getHours();

//     const nextTemps = temps.slice(currentHour, currentHour + 3);
//     const nextRains = rains.slice(currentHour, currentHour + 3);

//     const next3Hours = {
//       maxTemp: nextTemps.length ? Math.max(...nextTemps) : 0,
//       totalRain: nextRains.reduce((a, b) => a + b, 0),
//     };

//     const fullDay = {
//       maxTemp: daily.temperature_2m_max?.[0] || 0,
//       minTemp: daily.temperature_2m_min?.[0] || 0,
//       maxRain: daily.precipitation_sum?.[0] || 0,
//     };

//     return { next3Hours, fullDay, fallback: false };
//   } catch (err) {
//     console.error("❌ Weather API Error:", err.message);

//     return {
//       next3Hours: { maxTemp: 0, totalRain: 0 },
//       fullDay: { maxTemp: 0, minTemp: 0, maxRain: 0 },
//       fallback: true,
//     };
//   }
// };


import axios from "axios";

const api = axios.create({
  baseURL:
    process.env.WEATHER_API_URL ||
    "https://api.open-meteo.com/v1",
  timeout: 10000,
});

export const getWeatherForAlerts = async (lat, lon) => {
  try {
    const response = await api.get("/forecast", {
      params: {
        latitude: lat,
        longitude: lon,

        // ✅ Current live weather
        current:
          "temperature_2m,precipitation,wind_speed_10m",

        // ✅ Hourly forecast
        hourly: "temperature_2m,precipitation",

        // ✅ Daily forecast
        daily:
          "temperature_2m_max,temperature_2m_min,precipitation_sum",

        timezone: "auto",
      },
    });

    // ✅ Validate response
    if (
      !response.data?.current ||
      !response.data?.hourly ||
      !response.data?.daily
    ) {
      throw new Error("Invalid weather API response");
    }

    const current = response.data.current;
    const hourly = response.data.hourly;
    const daily = response.data.daily;

    const temps = hourly.temperature_2m || [];
    const rains = hourly.precipitation || [];

    // ✅ Current hour index
    const currentHour = new Date().getHours();

    // ✅ Next 3 hour forecast
    const nextTemps = temps.slice(
      currentHour,
      currentHour + 3,
    );

    const nextRains = rains.slice(
      currentHour,
      currentHour + 3,
    );

    // ✅ Weather summary
    const next3Hours = {
      currentTemp: current.temperature_2m || 0,
      windSpeed: current.wind_speed_10m || 0,
      totalRain: nextRains.reduce((a, b) => a + b, 0),
      maxTemp: nextTemps.length
        ? Math.max(...nextTemps)
        : current.temperature_2m || 0,
    };

    // ✅ Full day forecast
    const fullDay = {
      maxTemp: daily.temperature_2m_max?.[0] || 0,
      minTemp: daily.temperature_2m_min?.[0] || 0,
      maxRain: daily.precipitation_sum?.[0] || 0,
    };

    return {
      next3Hours,
      fullDay,
      fallback: false,
    };
  } catch (err) {
    console.error(
      "❌ Weather API Error:",
      err.code || err.message,
    );

    // ✅ Safe fallback
    return {
      next3Hours: {
        currentTemp: 0,
        windSpeed: 0,
        totalRain: 0,
        maxTemp: 0,
      },

      fullDay: {
        maxTemp: 0,
        minTemp: 0,
        maxRain: 0,
      },

      fallback: true,
    };
  }
};