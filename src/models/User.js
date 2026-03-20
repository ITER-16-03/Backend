import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },

  email: { type: String, required: true, unique: true },

  password: { type: String, required: true },

  location: {
    lat: Number,
    lon: Number
  },

  cropHistory: [],
  diseaseHistory: [],
  yieldHistory: [],

}, { timestamps: true });

export default mongoose.model("User", userSchema);