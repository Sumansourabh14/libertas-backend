// Middleware for validating token
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/UserModel");

const authMiddlware = asyncHandler(async (req, res, next) => {
  const { token } = req.cookies;
  console.log({ token });

  if (!token) {
    res.status(401);
    return next(new Error("Invalid token"));
  }

  const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

  req.user = await UserModel.findById(decoded.user.id);

  next();
});

module.exports = authMiddlware;
