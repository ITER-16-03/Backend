import axios from "axios";
import User from "../models/User.js";

//  7-day forecast + real humidity
const getWeatherForecast = async (lat, lon) => {
  try {
    const response = await axios.get(
      "https://api.open-meteo.com/v1/forecast",
      {
        params: {
          latitude: lat,
          longitude: lon,
          daily: "temperature_2m_max,temperature_2m_min,precipitation_sum",
          hourly: "relativehumidity_2m",
          timezone: "auto"
        }
      }
    );

    const daily = response.data.daily;
    const hourly = response.data.hourly;

    let totalTemp = 0;
    let totalRain = 0;
    let totalHumidity = 0;

    const days = 7;
    const hours = days * 24;

    //  Temperature + Rainfall
    for (let i = 0; i < days; i++) {
      totalTemp +=
        (daily.temperature_2m_max[i] + daily.temperature_2m_min[i]) / 2;

      totalRain += daily.precipitation_sum[i];
    }

    //  Humidity (hourly avg)
    for (let i = 0; i < hours; i++) {
      totalHumidity += hourly.relativehumidity_2m[i];
    }

    return {
      temperature: totalTemp / days,
      rainfall: totalRain,
      humidity: totalHumidity / hours
    };

  } catch (error) {
    console.error("Weather Error:", error.message);
    throw new Error("Failed to fetch weather data");
  }
};

//  Season detection
const getSeason = () => {
  const month = new Date().getMonth() + 1;

  if (month >= 6 && month <= 10) return "Kharif";
  if (month >= 11 || month <= 3) return "Rabi";
  return "Zayad";
};

//  MAIN CONTROLLER
export const predictCrop = async (req, res) => {
  try {
    const {
      lat,
      lon,
      nitrogen,
      phosphorus,
      potassium,
      ph,
      soil
    } = req.body || {};

    //  Validation
    if (!lat || !lon) {
      return res.status(400).json({ error: "Location (lat, lon) required" });
    }

    if (!nitrogen || !phosphorus || !potassium || !ph || !soil) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    //  Get weather
    const weather = await getWeatherForecast(lat, lon);

    //  Season
    const season = getSeason();

    //  ML input
    const finalData = {
      nitrogen,
      phosphorus,
      potassium,
      ph,
      soil,
      season,
      ...weather
    };

    //  Call ML API
    const mlResponse = await axios.post(
      process.env.ML_API_URL,
      finalData
    );

    const prediction = mlResponse.data;

    //  Save history 
    if (req.user?._id) {
      await User.findByIdAndUpdate(req.user._id, {
        $push: {
          cropHistory: {
            input: finalData,
            result: prediction,
            createdAt: new Date()
          }
        }
      });
    }

    // 
    res.status(200).json({
      soilType: soil,
      weather,
      recommendedCrops: prediction
    });

  } catch (error) {
    console.error("Prediction Error:", error.message);

    res.status(500).json({
      error: error.message
    });
  }
};