import express from "express";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { UserModel as User } from "../models/UserModel.js";

const UserRouter = express.Router();

UserRouter.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields must be provided" });
  }
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      message:
        "Password must contain at least 8 characters, one uppercase, one lowercase, one number, and one special character.",
    });
  }
  const user = await User.findOne({ email });
  try {
    if (user) {
      console.log(user);
      return res.status(200).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// login
UserRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
    const user = await User.findOne({ email });

    if (!user) {
      // console.log("User not found:", email);
      return res
        .status(404)
        .json({ message: "User not found, Please Sign up" });
    }

    // Now it's safe to log user details

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    //token
    const token = jwt.sign({ username: user.username }, process.env.TOKEN_KEY, {
      expiresIn: "1h",
    });
    res.cookie("token", token, { httpOnly: true, maxAge: 360000 });
    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
});

// forgot password
UserRouter.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.staus(404).json({ message: "Enter your email address" });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const token = jwt.sign({ id: user._id }, process.env.TOKEN_KEY, {
      expiresIn: "5m",
    });

    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS,
      },
    });

    var mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Reset Password",
      text: `http://localhost:5173/reset-password/${token}`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        return res.status(500).json({ message: "Error while sending email" });
      } else {
        return res
          .status(200)
          .json({ message: "Email sent: " + info.response });
      }
    });
  } catch (error) {
    console.log(error);
  }
});

UserRouter.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    toast.error(
      "Password must contain at least 8 characters, one uppercase, one lowercase, one number, and one special character."
    );
    return;
  }
  try {
    const decoded = jwt.verify(token, process.env.TOKEN_KEY);
    const id = decoded.id;
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate({ _id: id }, { password: hashedPassword });
    return res.status(200).json({ message: "Updated Password" });
  } catch (error) {
    console.log(error);
    return res.status(403).json({ message: "Token expired or invalid" });
  }
});

const verifyUser = async (req, res, next) => {
  try {
    // if not, send an error message
    const token = await req.cookies.token;
    if (!token) {
      return res.json({ status: false, message: "Not a valid token" });
    }
    const decoded = jwt.verify(token, process.env.TOKEN_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    return res.json(error);
  }
};
UserRouter.get("/verify", verifyUser, async (req, res) => {
  return res.json({ status: true, message: "Authentication is done" });
});

UserRouter.get("/logout", (req, res) => {
  res.clearCookie("token");
  return res.json({ status: true, message: "logout Successfully" });
});

UserRouter.get("/user", verifyUser, async (req, res) => {
  try {
    const { username } = req.user; // Get username from decoded token
    return res.json({ status: true, username });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "Error retrieving user data" });
  }
});

export { UserRouter };
