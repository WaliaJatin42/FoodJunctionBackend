const mongoose = require("mongoose");

const inventoryItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a raw material name (e.g., Coffee Beans)"],
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
    },
    unit: {
      type: String, // kg, liters, units
      required: true,
    },
    minStockLevel: {
      type: Number, // Threshold for low stock warning
      default: 5,
    },
    vendor: {
      type: mongoose.Schema.ObjectId,
      ref: "Vendor",
    },
    lastRestocked: Date,
  },
  { timestamps: true },
);

module.exports = mongoose.model("InventoryItem", inventoryItemSchema);
