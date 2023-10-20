const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const UserModel = require("../models/UserModel");
const nodemailer = require("nodemailer");

const signUpController = asyncHandler(async (req, res, next) => {
  const { name, username, email, password } = req.body;

  if (!name || !username || !email || !password) {
    res.status(400);
    return next(new Error("All fields are required"));
  }

  // Check if user already exists (by email)
  const userAvailable = await UserModel.findOne({ email });

  if (userAvailable) {
    res.status(400);
    return next(new Error("User is already registered!"));
  }

  // Check if username already exists
  const usernameIsPresent = await UserModel.findOne({ username: username });

  if (usernameIsPresent) {
    res.status(400);
    return next(new Error("Username is NOT available!"));
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await UserModel.create({
    name,
    username,
    email,
    password: hashedPassword,
  });

  const signUpHtml = `
    <p>Hi, ${user.name},</p>
    <p>You have successfully signed up on <strong>Libertas</strong> and ready to get started!</p>
    <p><strong>Username:<strong> ${user.username}</p>
    <a href="https://libertas-vert.vercel.app/login">Login here</a>
  `;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GOOGLE_ACCOUNT_USER,
      pass: process.env.GOOGLE_ACCOUNT_PASS,
    },
  });

  if (user) {
    // sending email with nodemailer
    const info = await transporter.sendMail({
      from: '"Libertas" <libertas.discussion@gmail.com>', // sender address
      to: user.email,
      subject: `Welcome to Libertas, ${user.name}!`, // Subject line
      html: signUpHtml, // html body
    });

    res.status(201).json({
      success: true,
      message: "User has been added to the database!",
      id: user._id,
      email: user.email,
      info: info,
    });
  } else {
    res.status(400);
    return next(new Error("User data is not valid"));
  }
});

const isUsernameAvailableController = asyncHandler(async (req, res, next) => {
  const { username } = req.body;

  if (!username) {
    res.status(400);
    return next(new Error("Username is not filled!"));
  }

  // Check if username already exists
  const userIsPresent = await UserModel.findOne({ username: username });

  if (userIsPresent) {
    res.status(400);
    return next(new Error("Oops! Username is not available!"));
  }

  res.status(201).json({
    success: true,
    message: "Username is available!",
  });
});

const sendPasswordRecoveryEmail = asyncHandler(async (req, res, next) => {
  const { emailOrUsername } = req.body;

  if (!emailOrUsername) {
    res.status(400);
    return next(new Error("Field is required"));
  }

  // Find the user
  let userAvailable;
  if (emailOrUsername.includes("@")) {
    userAvailable = await UserModel.findOne({ email: emailOrUsername });
  } else {
    userAvailable = await UserModel.findOne({ username: emailOrUsername });
  }

  if (!userAvailable) {
    res.status(400);
    return next(new Error("User is not found"));
  }

  // const html = `
  //   <p>Hi, ${userAvailable.name},</p>
  //   <p>Here's your password recovery link</p>
  //   <a href="https://localhost:7002/reset-password/${userAvailable._id}">Reset password here</a>
  //   <p>Best regards, Libertas</p>
  // `;

  const html = `
    <p>Hi, ${userAvailable.name},</p>
    <p>Here's your password recovery link</p>
    <a href="https://libertas-vert.vercel.app/reset-password/${userAvailable._id}">Reset password here</a>
    <p>Best regards, Libertas</p>
  `;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GOOGLE_ACCOUNT_USER,
      pass: process.env.GOOGLE_ACCOUNT_PASS,
    },
  });

  if (userAvailable) {
    // sending email with nodemailer
    const info = await transporter.sendMail({
      from: '"Libertas" <libertas.discussion@gmail.com>', // sender address
      to: userAvailable.email,
      subject: `Reset your Libertas password`, // Subject line
      html: html, // html body
    });

    res.status(201).json({
      success: true,
      message: "Password recovery email has been sent succesfully",
      id: userAvailable._id,
      email: userAvailable.email,
      info: info,
    });
  } else {
    res.status(400);
    return next(new Error("Something went wrong!"));
  }
});

const resetPassword = asyncHandler(async (req, res, next) => {
  const { id, password, confirmPassword } = req.body;

  if (!password || !confirmPassword) {
    res.status(400);
    return next(new Error("Both password fields are required"));
  }

  // Find the user
  if (password !== confirmPassword) {
    res.status(400);
    return next(new Error("Passwords do not match"));
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const updateUser = await UserModel.findByIdAndUpdate(
    id,
    {
      password: hashedPassword,
    },
    {
      new: true,
    }
  );

  if (updateUser) {
    res.status(201).json({
      success: true,
      message: "Password has been reset succesfully",
      user: updateUser._id,
    });
  } else {
    res.status(400);
    return next(new Error("Something went wrong!"));
  }
});

const getUsers = asyncHandler(async (req, res, next) => {
  const users = await UserModel.find();

  res.status(200).json({ success: true, totalUsers: users.length, users });
});

const getUserDetails = (req, res) => {
  res.status(200).json({ success: true, user: req.user });
};

const getUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const user = await UserModel.findById(id);

  if (!user) {
    res.status(400);
    return next(new Error("User not found"));
  }

  res.json({
    success: true,
    user,
  });
});

const getUserByEmailOrUsername = asyncHandler(async (req, res, next) => {
  const { emailOrUsername } = req.params;
  console.log("emailOrUsername: ", emailOrUsername);

  if (!emailOrUsername) {
    res.status(400);
    return next(new Error("Field is required"));
  }

  let user = {};

  if (emailOrUsername.includes("@")) {
    user = await UserModel.findOne({ email: emailOrUsername });
  } else {
    user = await UserModel.findOne({ username: emailOrUsername });
  }

  if (!user) {
    res.status(400);
    return next(new Error("User not found"));
  }

  res.json({
    success: true,
    user,
  });
});

const updateUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  console.log("req.body -------------------", req.body);

  const { bio, twitter, website } = req.body;

  const user = await UserModel.findById(id);

  if (!user) {
    res.status(400);
    return next(new Error("User not found"));
  }

  let updateUser = {};

  if (
    bio !== "undefined" ||
    twitter !== "undefined" ||
    website !== "undefined"
  ) {
    updateUser = await UserModel.findByIdAndUpdate(id, req.body, {
      new: true,
    });
  }

  res.json({
    success: true,
    message: "User details have been updated successfully!",
    updateUser,
  });
});

const deleteUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const user = await UserModel.findById(id);

  if (!user) {
    res.status(400);
    return next(new Error("User not found"));
  }

  const deletedUser = await UserModel.findByIdAndRemove(id);

  res.json({
    success: true,
    message: "User has been deleted successfully!",
    deletedUser,
  });
});

module.exports = {
  signUpController,
  isUsernameAvailableController,
  sendPasswordRecoveryEmail,
  resetPassword,
  getUsers,
  getUser,
  getUserByEmailOrUsername,
  getUserDetails,
  deleteUser,
  updateUser,
};
