const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a product name"],
      trim: true,
    },
    description: String,
    price: {
      type: Number,
      required: [true, "Please add a product price"],
    },
    image: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop",
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
      required: true,
    },
    ingredients: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "InventoryItem",
      },
    ],
    available: {
      type: Boolean,
      default: true,
    },
    stock: {
      type: Number,
      default: 100, // Example simple inventory tracking
    },
    customizations: [
      {
        name: String, // e.g., 'Size', 'Milk Option'
        options: [
          {
            choice: String, // e.g., 'Large', 'Almond Milk'
            priceAddOn: { type: Number, default: 0 },
          },
        ],
        required: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true },
);

productSchema.index({ available: 1, category: 1 });

module.exports = mongoose.model("Product", productSchema);
