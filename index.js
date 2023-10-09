const express = require("express");
const dotenv = require("dotenv").config();
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const connectDb = require("./utils/connectDb");
const multer = require("multer");
const forms = multer();
connectDb();

// routes
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const errorHandler = require("./middlewares/errorMiddleware");

const port = process.env.PORT || 7003;

app.get("/", async (req, res) => {
  res.json({ message: "Home page" });
});

app.use(express.json());
app.use(forms.array()); // read multipart form data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.FRONTEND_URI,
    credentials: true,
  })
);

app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
