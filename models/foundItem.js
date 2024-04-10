const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const foundItemSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    contactNo: {
      type: Number,
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
  { collection: "FoundItems" }
);

const FoundItem = mongoose.model("foundItem", foundItemSchema);
module.exports = FoundItem;
