const mongoose = require("mongoose");

const lostItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    contactNo: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    item: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    image: {
      type: String,
      required: false,
    },
    userEmail: {
      type: String,
      required: true,
    },
  },
  { collection: "LostItems" }
);

const LostItem = mongoose.model("LostItem", lostItemSchema);

module.exports = LostItem;
