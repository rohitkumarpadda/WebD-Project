require("dotenv").config(); // Load environment variables

const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const LoginData = require("./models/loginData");
const bcrypt = require("bcrypt");
const session = require("express-session");
const rateLimit = require("express-rate-limit");

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    //add cookie:{secure: true}, in production
  })
);

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use(rateLimiter);

app.use(express.static("./public"));

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

const isLoggedIn = (req, res, next) => {
  if (req.session.loggedInUser) {
    next();
  } else {
    res.redirect("/login");
  }
};

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "pages/index.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "pages/final login page.html"));
});

app.get("/afterlogin", isLoggedIn, (req, res) => {
  res.sendFile(path.join(__dirname, "pages/AfterLoginPage1.html"));
});

app.get("/reportLost", isLoggedIn, (req, res) => {
  res.sendFile(path.join(__dirname, "pages/LostReportPage.html"));
});

app.get("/reportFound", isLoggedIn, (req, res) => {
  res.sendFile(path.join(__dirname, "pages/RegisterPage.html"));
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.redirect("/login");
    }
    res.clearCookie("sid");
    res.redirect("/");
  });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    // Validate email format
    if (!isValidEmail(email)) {
      return res.status(400).send("Invalid email format");
    }

    // Use Mongoose's findOne method with query building
    const user = await LoginData.findOne({ email: req.body.email });

    // Check if user exists and validate password
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).send("Invalid email or password");
    }

    req.session.loggedInUser = user;
    res.redirect("/afterlogin");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

function isValidEmail(email) {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}
