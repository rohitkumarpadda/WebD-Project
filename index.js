const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const LoginData = require("./models/loginData");
const bcrypt = require("bcrypt");
const session = require("express-session");
const rateLimit = require("express-rate-limit");
mongoose.connect("mongodb://localhost:27017/LostAndFound", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: "$2b$10$RNoYDxTB/wd1wZhnUqCnV.Jmmp62zisa.eTfF7EhMWhm0GKzrh7yu",
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

app.listen(3000, () => {
  console.log("Server is running on port 3000");
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
    const user = await LoginData.findOne({ email });
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res
        .status(401)
        .send(
          "<script>alert('Invalid email or password. Please try again.'); window.location.href = '/login';</script>"
        );
    }
    req.session.loggedInUser = user;
    res.redirect("/afterlogin");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});
