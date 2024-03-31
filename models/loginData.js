const mongoose = require("mongoose");

const loginDataSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { collection: "LoginData" }
);

const LoginData = mongoose.model("LoginData", loginDataSchema);

module.exports = LoginData;
