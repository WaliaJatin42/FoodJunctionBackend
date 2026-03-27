const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: [true, "Please add a phone number"],
      unique: true,
    },
    name: String,
    loyaltyPoints: {
      type: Number,
      default: 0,
    },
    membershipTier: {
      type: String,
      enum: ["none", "silver", "gold", "platinum"],
      default: "none",
    },
    subscriptionActiveUntil: Date,
    streakDays: {
      type: Number,
      default: 0,
    },
    lastVisit: Date,
    savedAddresses: [
      {
        label: String,
        address: String,
        pincode: String,
      },
    ],
    favoriteCustomizations: [
      {
        product: { type: mongoose.Schema.ObjectId, ref: "Product" },
        customizations: [Object],
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Customer", customerSchema);
