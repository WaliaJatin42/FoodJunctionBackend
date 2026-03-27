const mongoose = require("mongoose");

const deliverySchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.ObjectId,
      ref: "Order",
      required: true,
    },
    deliveryBoy: {
      type: mongoose.Schema.ObjectId,
      ref: "User", // Assuming delivery boys are a type of Employee/User
    },
    status: {
      type: String,
      enum: ["unassigned", "assigned", "picked_up", "delivered", "failed"],
      default: "unassigned",
    },
    otp: {
      type: String,
      required: true, // Simple code for the customer to verify handover
    },
    eta: Date,
  },
  { timestamps: true },
);

module.exports = mongoose.model("Delivery", deliverySchema);
