import User from "../models/User.js";
import bcrypt from "bcryptjs";
import otpGenerator from "otp-generator";
import { generateToken } from "../config/jwt.js";

//REGISTER
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, location } = req.body;

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      location
    });

    const token = generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      message: "Registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//LOGIN
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//LOGOUT
export const logoutUser = async (req, res) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      expires: new Date(0)
    });

    res.status(200).json({
      message: "Logged out successfully"
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//
export const getProfile = async (req, res) => {
  res.status(200).json(req.user);
};

// /* ================= SEND OTP ================= */
// export const sendOtp = async (req, res) => {
//   try {
//     const { email } = req.body;

//     const user = await User.findOne({ email });
//     if (!user)
//       return res.status(404).json({ message: "User not found" });

//     const otp = otpGenerator.generate(6, {
//       digits: true,
//       alphabets: false,
//       upperCase: false,
//       specialChars: false
//     });

//     user.otp = otp;
//     user.otpExpiry = Date.now() + 5 * 60 * 1000;

//     await user.save();

//     console.log("OTP:", otp);

//     res.status(200).json({
//       message: "OTP sent successfully"
//     });

//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// /* ================= VERIFY OTP ================= */
// export const verifyOtp = async (req, res) => {
//   try {
//     const { email, otp } = req.body;

//     const user = await User.findOne({ email });

//     if (
//       !user ||
//       user.otp !== otp ||
//       user.otpExpiry < Date.now()
//     ) {
//       return res.status(400).json({ message: "Invalid or expired OTP" });
//     }

//     res.status(200).json({
//       message: "OTP verified"
//     });

//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// /* ================= RESET PASSWORD ================= */
// export const resetPassword = async (req, res) => {
//   try {
//     const { email, otp, newPassword } = req.body;

//     const user = await User.findOne({ email });

//     if (
//       !user ||
//       user.otp !== otp ||
//       user.otpExpiry < Date.now()
//     ) {
//       return res.status(400).json({ message: "Invalid or expired OTP" });
//     }

//     const hashed = await bcrypt.hash(newPassword, 10);

//     user.password = hashed;
//     user.otp = null;
//     user.otpExpiry = null;

//     await user.save();

//     res.status(200).json({
//       message: "Password reset successful"
//     });

//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };


// export const sendOtp = async (req, res) => {
//   try {
//     const { email } = req.body;

//     const user = await User.findOne({ email });

//     // 🔥 Security (optional: hide user existence)
//     if (!user)
//       return res.status(200).json({ message: "If email exists, OTP sent" });

//     // 🔥 Cooldown check (1 min)
//     if (user.otpCooldown && user.otpCooldown > Date.now()) {
//       return res.status(429).json({
//         message: "Please wait before requesting another OTP"
//       });
//     }

//     const otp = otpGenerator.generate(6, {
//       digits: true,
//       alphabets: false,
//       upperCase: false,
//       specialChars: false
//     });

//     user.otp = otp;
//     user.otpExpiry = Date.now() + 5 * 60 * 1000;
//     user.otpCooldown = Date.now() + 60 * 1000; // 1 min cooldown

//     await user.save();

//     console.log("OTP:", otp);

//     res.status(200).json({
//       message: "OTP sent successfully"
//     });

//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// export const verifyOtp = async (req, res) => {
//   try {
//     const { email, otp } = req.body;

//     const user = await User.findOne({ email });

//     if (
//       !user ||
//       user.otp !== otp ||
//       user.otpExpiry < Date.now()
//     ) {
//       return res.status(400).json({ message: "Invalid or expired OTP" });
//     }

//     // 🔥 CLEAR OTP after verification
//     user.otp = null;
//     user.otpExpiry = null;

//     await user.save();

//     res.status(200).json({
//       message: "OTP verified"
//     });

//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// export const resetPassword = async (req, res) => {
//   try {
//     const { email, otp, newPassword } = req.body;

//     const user = await User.findOne({ email });

//     if (
//       !user ||
//       user.otp !== otp ||
//       user.otpExpiry < Date.now()
//     ) {
//       return res.status(400).json({ message: "Invalid or expired OTP" });
//     }

//     const hashed = await bcrypt.hash(newPassword, 10);

//     user.password = hashed;

//     // 🔥 CLEAR OTP
//     user.otp = null;
//     user.otpExpiry = null;

//     await user.save();

//     res.status(200).json({
//       message: "Password reset successful"
//     });

//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };





