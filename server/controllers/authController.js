import bcrypt from "bcrypt";
import User from "../models/User.js";

export const registerController = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      picturePath,
      friends,
      location,
      occupation,
    } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "Missing Credentials." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists." });
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: passwordHash,
      picturePath,
      friends,
      location,
      occupation,
      viewedProfile: Math.floor(Math.random() * 10000),
      impressions: Math.floor(Math.random() * 10000),
    });

    await newUser.save();

    res.status(201).json({ newUser, message: "Registered successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
