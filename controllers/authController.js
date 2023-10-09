const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/UserModel");
const nodemailer = require("nodemailer");

const loginController = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    return next(new Error("All fields are required"));
  }

  const user = await UserModel.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    const accessToken = jwt.sign(
      {
        user: {
          username: user.username,
          email: user.email,
          id: user.id,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    // sending email with nodemailer
    const loginHtml = `
      <p>Hi, ${user.name},</p>
      <p>You have successfully logged in to Libertas!</p>
    `;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GOOGLE_ACCOUNT_USER,
        pass: process.env.GOOGLE_ACCOUNT_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: '"Libertas" <libertas.discussion@gmail.com>', // sender address
      to: user.email, // list of receivers
      subject: "New login to Libertas", // Subject line
      html: loginHtml, // html body
    });

    res
      .status(200)
      .cookie("token", accessToken, {
        httpOnly: true,
        maxAge: 60 * 60 * 1000,
        sameSite: process.env.NODE_ENV === "development" ? "lax" : "none",
        secure: process.env.NODE_ENV === "development" ? false : true,
      })
      .json({
        success: true,
        message: "User logged in successfully",
        accessToken,
        emailInfo: info,
      });
  } else {
    res.status(400);
    return next(new Error("Incorrect email or password"));
  }
});

const logoutController = asyncHandler(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", null, {
      expires: new Date(Date.now()),
      sameSite: process.env.NODE_ENV === "development" ? "lax" : "none",
      secure: process.env.NODE_ENV === "development" ? false : true,
    })
    .json({
      success: true,
      message: `User logged out successfully`,
    });
});

module.exports = { loginController, logoutController };
