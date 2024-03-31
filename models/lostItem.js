const mongoose = require("mongoose");

const lostItemSchema = new mongoose.Schema(
  {
    name: String,
    contactNo: String,
    category: String,
    item: String,
    dateFound: Date,
    description: String,
    imageUrl: String,
  },
  { collection: "LostItems" }
);

const LostItem = mongoose.model("LostItem", lostItemSchema);

module.exports = LostItem;
