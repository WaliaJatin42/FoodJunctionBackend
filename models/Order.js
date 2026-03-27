const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    employee: {
      // If created by employee in cafe
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    orderType: {
      type: String,
      enum: ["online_pickup", "delivery", "table_qr", "cafe"],
      default: "cafe",
    },
    customerPhone: String, // For linking to Customer or SMS
    deliveryAddress: {
      address: String,
      pincode: String,
    },
    eta: Date, // Estimated time of pickup/delivery
    items: [
      {
        product: {
          type: mongoose.Schema.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        },
        customizations: [
          {
            name: String,
            choice: String,
            priceAddOn: Number,
          },
        ],
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "upi", "razorpay"],
      required: true,
    },
    status: {
      type: String,
      enum: ["received", "preparing", "completed", "cancelled"],
      default: "received",
    },
    queuePosition: {
      type: Number,
      default: null,
    },
    vip: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

orderSchema.index({ status: 1, queuePosition: 1, employee: 1 });

module.exports = mongoose.model("Order", orderSchema);
