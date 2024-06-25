import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const registerController = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "Missing Credentials." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists." });
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    let picturePath = "";
    if (req.file) {
      picturePath = req.file.path;
    }

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: passwordHash,
      picturePath,
      viewedProfile: Math.floor(Math.random() * 10000),
      impressions: Math.floor(Math.random() * 10000),
    });

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({ token, message: "Registered successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const fetchUserInfoUsingJWTToken = async (req, res) => {
  try {
    const { email } = req.user;

    // Check if email is provided in the query
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    // Check if user exists in the database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Extract non-sensitive user data to return
    const { password, ...rest } = user.toObject(); // Convert Mongoose document to plain JS object
    const userData = Object.assign({}, rest);

    res.json({ user: userData, message: "User Info fetched" });
  } catch (error) {
    res.status(500).json({ message: "Error while fetching user Info." });
  }
};

export const fetchUserInfoUsingEmail = async (req, res) => {
  try {
    const { email } = req.body;

    console.log("email is ", email);

    // Check if email is provided in the request body
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Check if user exists in the database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("user is ", user);

    // Extract non-sensitive user data to return
    const { password, ...nonSensitiveUserData } = user.toObject(); // Convert Mongoose document to plain JS object

    res.json({
      user: nonSensitiveUserData,
      message: "User Info fetched successfully",
    });
  } catch (error) {
    console.log("error is ", error);
    res.status(500).json({ message: "Error while fetching user info." });
  }
};
