const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const UserModel = require("../models/UserModel");

const signUpController = asyncHandler(async (req, res, next) => {
  const { name, username, email, password } = req.body;

  if (!name || !username || !email || !password) {
    res.status(400);
    return next(new Error("All fields are required"));
  }

  // Check if user already exists
  const userAvailable = await UserModel.findOne({ email });

  if (userAvailable) {
    res.status(400);
    return next(new Error("User is already registered!"));
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await UserModel.create({
    name,
    username,
    email,
    password: hashedPassword,
  });

  if (user) {
    res.status(201).json({
      success: true,
      message: "User has been added to the database!",
      id: user._id,
      email: user.email,
    });
  } else {
    res.status(400);
    return next(new Error("User data is not valid"));
  }
});

const getUsers = asyncHandler(async (req, res, next) => {
  const users = await UserModel.find();

  res.status(200).json({ success: true, totalUsers: users.length, users });
});

const getUserDetails = (req, res) => {
  res.status(200).json({ success: true, user: req.user });
};

const updateUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const user = await UserModel.findById(id);

  if (!user) {
    res.status(400);
    return next(new Error("User not found"));
  }

  const updateUser = await UserModel.findByIdAndUpdate(id, req.body, {
    new: true,
  });

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
  getUsers,
  getUserDetails,
  deleteUser,
  updateUser,
};
