const express = require("express");
const User = require("../model/models");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/utils");
const varifyToken = require("../middleware/middleware");
const nodemailer = require("nodemailer");
require("dotenv").config();

const router = express.Router();

router.get("/test", (req, res) =>
  res.json({ message: "Api testing Sucessful" })
);

router.post("/user", async (req, res) => {
  const {firstName,lastName, email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ firstName,lastName,email, password: hashedPassword });
    await newUser.save();

    return res.status(201).json({ message: "User created" });
  }
  res.status(404).json({ message: "User Already Exists" });
});

router.post("/authenticate", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: "User not Found" });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(401).json({ message: "Incorrect Password" });
  }

  const token = generateToken(user);
  res.json(token);
});

router.get("/data", varifyToken, (req, res) => {
  res.json({ message: `Welcome ${req.user.email}! This is protected data` });
});

router.post("/reset-password", async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const token = Math.random().toString(36).slice(-8);
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 3600000; //1hour

  await user.save();

  const transpoter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "jeyaramanapr22@gmail.com",
      pass: process.env.MAIL_PASS,
    },
  });

  const message = {
    from: "jeyaramanapr22@gmail.com",
    to: user.email,
    subject: "password reset request",
    text: `You are receiving this email because you (or someone else) has requested a password reset your account. \n\n Please use the following token to reset your password: ${token}\n\n If you did not request a password reset,please ignore this email`,
  };
  transpoter.sendMail(message, (err, info) => {
    if (err) {
      res.status(404).json({ message: "Somthing went wrong , Try again" });
    }
    res.status(200).json({ message: "Email Sent" + info.response });
  });
});

router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(404).json({ message: "Invalid Token" });
  }

  const hashPassword = await bcrypt.hash(password, 10);

  user.password = hashPassword;
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;

  await user.save();

  res.json({ message: "Password reset successfully" });
});

module.exports = router;
