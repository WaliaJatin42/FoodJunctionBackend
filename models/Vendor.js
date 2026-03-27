const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a vendor name"],
      unique: true,
    },
    contactPerson: String,
    phone: {
      type: String,
      required: true,
    },
    email: String,
    address: String,
    suppliedItems: [String], // Short descriptors like "Coffee Beans", "Milk"
  },
  { timestamps: true },
);

module.exports = mongoose.model("Vendor", vendorSchema);
