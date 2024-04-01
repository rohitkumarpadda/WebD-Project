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
    dateFound: {
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
    userEmail: {
      type: String,
      required: true,
    },
  },
  { collection: "FoundItems" }
);

const FoundItem = mongoose.model("foundItem", foundItemSchema);
module.exports = FoundItem;
