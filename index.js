const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const LoginData = require("./models/loginData");
const bcrypt = require("bcrypt");
mongoose.connect("mongodb://localhost:27017/LostAndFound", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(express.static("./public"));

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "pages/index.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "pages/final login page.html"));
});

app.get("/afterlogin", (req, res) => {
  res.sendFile(path.join(__dirname, "pages/AfterLoginPage1.html"));
});

app.get("/reportLost", (req, res) => {
  res.sendFile(path.join(__dirname, "pages/LostReportPage.html"));
});

app.get("/reportFound", (req, res) => {
  res.sendFile(path.join(__dirname, "pages/RegisterPage.html"));
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    // Find user by email
    const user = await LoginData.findOne({ email });
    if (!user || !bcrypt.compareSync(password, user.password)) {
      // If user not found or password incorrect, show alert and redirect
      return res
        .status(401)
        .send(
          "<script>alert('Invalid email or password. Please try again.'); window.location.href = '/login';</script>"
        );
    }
    // Redirect to afterlogin page if login successful
    res.redirect("/afterlogin");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});
