const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/LostAndFound", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(express.static('./public'));

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