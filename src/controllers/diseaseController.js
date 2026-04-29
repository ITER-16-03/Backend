import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import User from "../models/User.js";

export const detectDisease = async (req, res) => {
  let result;

  try {
    if (!req.file) {
      return res.status(400).json({ error: "Image is required" });
    }

    // 📦 send image to ML model
    const formData = new FormData();
    formData.append("file", fs.createReadStream(req.file.path));

    const mlResponse = await axios.post(
      process.env.ML_DISEASE_API,
      formData,
      {
        headers: formData.getHeaders(),
        timeout: 10000
      }
    );

    // 🎯 ONLY disease
    result = {
      disease: mlResponse.data.disease || "Unknown"
    };

  } catch (error) {
    console.error("ML Error:", error.message);

    // 🛡️ fallback
    result = {
      disease: "Unknown Disease"
    };
  }

  try {
    // 💾 save in DB
    if (req.user?._id) {
      await User.findByIdAndUpdate(req.user._id, {
        $push: {
          diseaseHistory: {
            image: req.file?.filename,
            result,
            createdAt: new Date()
          }
        }
      });
    }
  } catch (dbError) {
    console.error("DB Error:", dbError.message);
  }

  res.status(200).json({
    message: "Detection completed",
    result
  });
};