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
    dateLost: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
  },
  { collection: "LostItems" }
);

const LostItem = mongoose.model("LostItem", lostItemSchema);

module.exports = LostItem;
