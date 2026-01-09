import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import dotenv from "dotenv";

dotenv.config();

// token creation
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email" });
    }

    const user = await userModel.findOne({
  $or: [{ email }, { username: email }]
});

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const token = createToken(user._id);
    res.json({ success: true, token });

  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// register user
const registerUser = async (req, res) => {
  const { username, password, email } = req.body;

  try {
    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email" });
    }

    if (!validator.isStrongPassword(password)) {
      return res.status(400).json({ success: false, message: "Weak password" });
    }

    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      username,
      email,
      password: hashedPassword,
    });

    const token = createToken(user._id);
    res.json({ success: true, token });

  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export { loginUser, registerUser };
